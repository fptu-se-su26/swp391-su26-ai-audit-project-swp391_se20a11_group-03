package com.auction.event.scheduler;

import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.entity.EventRegistration;
import com.auction.event.entity.PennyBid;
import com.auction.event.enums.BiddingMode;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.enums.EventRegistrationStatus;
import com.auction.event.enums.EventStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.repository.PennyBidRepository;
import com.auction.event.service.EventNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventLifecycleScheduler {

    private final AuctionEventRepository eventRepository;
    private final EventProductRepository eventProductRepository;
    private final EventRegistrationRepository registrationRepository;
    private final PennyBidRepository pennyBidRepository;
    private final EventNotificationService eventNotificationService;

    @Scheduled(fixedDelay = 30000) // 30 seconds
    @Transactional
    public void processEventLifecycle() {
        log.info("Starting event lifecycle processing at {}", LocalDateTime.now());

        LocalDateTime now = LocalDateTime.now();

        // Step a: Publish -> Ongoing
        processEventsToStart(now);

        // Step b: End event products
        processEventProductsToEnd(now);

        // Step c: End events if all products are ended
        processEventsToEnd(now);

        log.info("Finished event lifecycle processing at {}", LocalDateTime.now());
    }

    @Transactional
    protected void processEventsToStart(LocalDateTime now) {
        List<AuctionEvent> publishedEvents = eventRepository.findByStatus(EventStatus.PUBLISHED);
        for (AuctionEvent event : publishedEvents) {
            try {
                if (event.getStartTime() != null && !now.isBefore(event.getStartTime())) {
                    event.setStatus(EventStatus.ONGOING);
                    event.setUpdatedAt(now);
                    eventRepository.save(event);
                    eventNotificationService.notifyEventOngoing(event.getEventId());
                    log.info("Event {} transitioned from PUBLISHED to ONGOING", event.getEventId());

                    // Also start event products with sessionStart <= now
                    List<EventProduct> products = eventProductRepository.findByEventId(event.getEventId());
                    for (EventProduct product : products) {
                        if (product.getSessionStatus() == EventProductSessionStatus.SCHEDULED
                                && product.getSessionStart() != null
                                && !now.isBefore(product.getSessionStart())) {
                            product.setSessionStatus(EventProductSessionStatus.ACTIVE);
                            eventProductRepository.save(product);
                            log.info("EventProduct {} started for event {}", product.getEventProductId(), event.getEventId());
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error processing event {} to start", event.getEventId(), e);
            }
        }
    }

    @Transactional
    protected void processEventProductsToEnd(LocalDateTime now) {
        List<EventProduct> activeProducts = eventProductRepository.findAll()
                .stream()
                .filter(p -> p.getSessionStatus() == EventProductSessionStatus.ACTIVE)
                .toList();

        for (EventProduct product : activeProducts) {
            try {
                if (product.getSessionEnd() != null && !now.isBefore(product.getSessionEnd())) {
                    AuctionEvent event = eventRepository.findById(product.getEventId()).orElse(null);
                    if (event == null) continue;

                    processEventProductEnd(event, product, now);
                }
            } catch (Exception e) {
                log.error("Error processing event product {} to end", product.getEventProductId(), e);
            }
        }
    }

    @Transactional
    protected void processEventProductEnd(AuctionEvent event, EventProduct product, LocalDateTime now) {
        BiddingMode mode = event.getBiddingMode();

        switch (mode) {
            case STANDARD, THEMED, CHARITY -> {
                // Standard, we'll just use currentPrice as final if there's a winner
                if (product.getWinnerId() != null && product.getCurrentPrice() != null) {
                    product.setSessionStatus(EventProductSessionStatus.ENDED_SOLD);
                    product.setFinalPrice(product.getCurrentPrice());
                    eventNotificationService.notifyEventEnded(event.getEventId(), product.getWinnerId(), true);
                } else {
                    product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
                }
            }
            case DUTCH -> {
                // Dutch: if no one bought, mark as unsold
                product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
            }
            case SEALED_BID -> {
                // Sealed: handled in SealedBidService.reveal(), mark as sold/unsold here
                // For now, just mark as unsold if no winner
                product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
            }
            case PENNY -> {
                // Penny: last bidder wins
                Optional<PennyBid> lastBid = pennyBidRepository.findLastBidByEventProductId(product.getEventProductId());
                if (lastBid.isPresent()) {
                    product.setSessionStatus(EventProductSessionStatus.ENDED_SOLD);
                    product.setWinnerId(lastBid.get().getUserId());
                    product.setFinalPrice(lastBid.get().getPriceAfterBid());
                    eventNotificationService.notifyEventEnded(event.getEventId(), lastBid.get().getUserId(), true);
                } else {
                    product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
                }
            }
        }

        eventProductRepository.save(product);
        log.info("EventProduct {} ended with status {}", product.getEventProductId(), product.getSessionStatus());
    }

    @Transactional
    protected void processEventsToEnd(LocalDateTime now) {
        List<AuctionEvent> ongoingEvents = eventRepository.findByStatus(EventStatus.ONGOING);

        for (AuctionEvent event : ongoingEvents) {
            try {
                if (event.getEndTime() != null && !now.isBefore(event.getEndTime())) {
                    List<EventProduct> products = eventProductRepository.findByEventId(event.getEventId());
                    boolean allEnded = products.stream()
                            .allMatch(p -> p.getSessionStatus() == EventProductSessionStatus.ENDED_SOLD
                                    || p.getSessionStatus() == EventProductSessionStatus.ENDED_UNSOLD
                                    || p.getSessionStatus() == EventProductSessionStatus.CANCELLED);
                    if (allEnded) {
                        event.setStatus(EventStatus.ENDED);
                        event.setUpdatedAt(now);
                        eventRepository.save(event);
                        log.info("Event {} transitioned from ONGOING to ENDED", event.getEventId());

                        // Notify all registered users
                        List<EventRegistration> registrations = registrationRepository.findByEventIdAndStatus(event.getEventId(), EventRegistrationStatus.REGISTERED);
                        for (EventRegistration reg : registrations) {
                            // TODO: Check if user won any product in event
                            eventNotificationService.notifyEventEnded(event.getEventId(), reg.getUserId(), false);
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error processing event {} to end", event.getEventId(), e);
            }
        }
    }
}
