package com.auction.event.scheduler;

import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.entity.EventRegistration;
import com.auction.event.entity.PennyBid;
import com.auction.event.enums.BiddingMode;
import com.auction.event.enums.EventProductApprovalStatus;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.enums.EventRegistrationStatus;
import com.auction.event.enums.EventStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.repository.PennyBidRepository;
import com.auction.event.service.EventNotificationService;
import com.auction.event.service.EventPaymentService;
import com.auction.event.service.SealedBidService;
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
    private final SealedBidService sealedBidService;
    private final EventPaymentService eventPaymentService;

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

        // Step d: forfeit event winners who missed their payment deadline
        try {
            int forfeited = eventPaymentService.forfeitOverdueEventPayments();
            if (forfeited > 0) {
                log.info("Forfeited {} overdue event product payments", forfeited);
            }
        } catch (Exception e) {
            log.error("Error forfeiting overdue event payments", e);
        }

        log.info("Finished event lifecycle processing at {}", LocalDateTime.now());
    }

    @Transactional
    protected void processEventsToStart(LocalDateTime now) {
        List<AuctionEvent> candidates = eventRepository.findByStatus(EventStatus.PUBLISHED);
        for (AuctionEvent candidate : candidates) {
            try {
                AuctionEvent event = eventRepository.findLockedById(candidate.getEventId()).orElse(null);
                if (event == null || event.getStatus() != EventStatus.PUBLISHED) {
                    continue;
                }
                if (event.getStartTime() != null && !now.isBefore(event.getStartTime())) {
                    event.setStatus(EventStatus.ONGOING);
                    event.setUpdatedAt(now);
                    eventRepository.save(event);
                    eventNotificationService.notifyEventOngoing(event.getEventId());
                    log.info("Event {} transitioned from PUBLISHED to ONGOING", event.getEventId());

                    // Also start event products with sessionStart <= now
                    List<EventProduct> products = eventProductRepository.findByEventIdAndApprovalStatus(
                            event.getEventId(), EventProductApprovalStatus.APPROVED);
                    for (EventProduct candidateProduct : products) {
                        EventProduct product = eventProductRepository
                                .findLockedById(candidateProduct.getEventProductId())
                                .orElse(null);
                        if (product == null) {
                            continue;
                        }
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
                log.error("Error processing event {} to start", candidate.getEventId(), e);
            }
        }
    }

    @Transactional
    protected void processEventProductsToEnd(LocalDateTime now) {
        List<EventProduct> activeProducts = eventProductRepository
                .findBySessionStatus(EventProductSessionStatus.ACTIVE);

        for (EventProduct candidate : activeProducts) {
            try {
                AuctionEvent event = eventRepository.findLockedById(candidate.getEventId()).orElse(null);
                if (event == null) {
                    continue;
                }
                EventProduct product = eventProductRepository
                        .findLockedById(candidate.getEventProductId())
                        .orElse(null);
                if (product == null
                        || product.getApprovalStatus() != EventProductApprovalStatus.APPROVED
                        || product.getSessionStatus() != EventProductSessionStatus.ACTIVE) {
                    continue;
                }
                if (product.getSessionEnd() != null && !now.isBefore(product.getSessionEnd())) {
                    processEventProductEnd(event, product, now);
                }
            } catch (Exception e) {
                log.error("Error processing event product {} to end", candidate.getEventProductId(), e);
            }
        }
    }

    @Transactional
    protected void processEventProductEnd(AuctionEvent event, EventProduct product, LocalDateTime now) {
        BiddingMode mode = event.getBiddingMode();

        switch (mode) {
            case STANDARD -> {
                // Standard, we'll just use currentPrice as final if there's a winner
                if (product.getWinnerId() != null && product.getCurrentPrice() != null) {
                    product.setSessionStatus(EventProductSessionStatus.ENDED_SOLD);
                    product.setFinalPrice(product.getCurrentPrice());
                    product.setPaymentStatus("AWAITING_PAYMENT");
                    product.setPaymentDeadline(now.plusHours(72));
                    eventNotificationService.notifyEventEnded(event.getEventId(), product.getWinnerId(), true);
                } else {
                    product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
                    product.setPaymentStatus("NO_WINNER");
                }
            }
            case DUTCH -> {
                // Dutch sells immediately on commit (which sets ENDED_SOLD), so a still-ACTIVE
                // Dutch product at end simply had no buyer.
                product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
                product.setPaymentStatus("NO_WINNER");
            }
            case SEALED_BID -> {
                // Reveal all sealed bids and pick the winner (highest, then earliest).
                // reveal() sets sessionStatus to ENDED_SOLD/ENDED_UNSOLD and persists on
                // the same managed EventProduct instance (same transaction), so the shared
                // save() below is a harmless no-op re-save.
                sealedBidService.reveal(product.getEventProductId());
            }
            case PENNY -> {
                // Penny: last bidder wins
                Optional<PennyBid> lastBid = pennyBidRepository.findLastBidByEventProductId(product.getEventProductId());
                if (lastBid.isPresent()) {
                    product.setSessionStatus(EventProductSessionStatus.ENDED_SOLD);
                    product.setWinnerId(lastBid.get().getUserId());
                    product.setFinalPrice(lastBid.get().getPriceAfterBid());
                    product.setPaymentStatus("AWAITING_PAYMENT");
                    product.setPaymentDeadline(now.plusHours(72));
                    eventNotificationService.notifyEventEnded(event.getEventId(), lastBid.get().getUserId(), true);
                } else {
                    product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
                    product.setPaymentStatus("NO_WINNER");
                }
            }
        }

        eventProductRepository.save(product);
        log.info("EventProduct {} ended with status {}", product.getEventProductId(), product.getSessionStatus());
    }

    @Transactional
    protected void processEventsToEnd(LocalDateTime now) {
        List<AuctionEvent> ongoingEvents = eventRepository.findByStatus(EventStatus.ONGOING);

        for (AuctionEvent candidate : ongoingEvents) {
            try {
                AuctionEvent event = eventRepository.findLockedById(candidate.getEventId()).orElse(null);
                if (event == null || event.getStatus() != EventStatus.ONGOING) {
                    continue;
                }
                if (event.getEndTime() != null && !now.isBefore(event.getEndTime())) {
                    List<EventProduct> products = eventProductRepository.findByEventIdAndApprovalStatus(
                            event.getEventId(), EventProductApprovalStatus.APPROVED);
                    boolean allEnded = products.stream()
                            .allMatch(p -> p.getSessionStatus() == EventProductSessionStatus.ENDED_SOLD
                                    || p.getSessionStatus() == EventProductSessionStatus.ENDED_UNSOLD
                                    || p.getSessionStatus() == EventProductSessionStatus.CANCELLED);
                    if (allEnded) {
                        event.setStatus(EventStatus.ENDED);
                        event.setUpdatedAt(now);
                        eventRepository.save(event);
                        log.info("Event {} transitioned from ONGOING to ENDED", event.getEventId());

                        // Release any registration deposits still held by non-winners.
                        try {
                            eventPaymentService.refundRemainingDeposits(event.getEventId());
                        } catch (Exception e) {
                            log.error("Error refunding remaining deposits for event {}", event.getEventId(), e);
                        }

                        // Notify only registered users who did NOT win any product — winners
                        // already got a per-product "you won" notification when it ended.
                        java.util.Set<Long> winnerIds = products.stream()
                                .map(EventProduct::getWinnerId)
                                .filter(java.util.Objects::nonNull)
                                .collect(java.util.stream.Collectors.toSet());
                        List<EventRegistration> registrations = registrationRepository.findByEventIdAndStatus(event.getEventId(), EventRegistrationStatus.REGISTERED);
                        for (EventRegistration reg : registrations) {
                            if (!winnerIds.contains(reg.getUserId())) {
                                eventNotificationService.notifyEventEnded(event.getEventId(), reg.getUserId(), false);
                            }
                        }
                    }
                }
            } catch (Exception e) {
                log.error("Error processing event {} to end", candidate.getEventId(), e);
            }
        }
    }
}
