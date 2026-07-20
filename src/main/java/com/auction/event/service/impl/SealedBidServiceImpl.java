package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.entity.SealedBid;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.SealedBidRepository;
import com.auction.event.service.EventNotificationService;
import com.auction.event.service.SealedBidService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SealedBidServiceImpl implements SealedBidService {

    private final AuctionEventRepository eventRepository;
    private final EventProductRepository eventProductRepository;
    private final SealedBidRepository sealedBidRepository;
    private final EventNotificationService eventNotificationService;

    @Override
    @Transactional
    public SealedBid submitBid(Long eventProductId, Long userId, Long bidAmount) {
        EventProduct product = eventProductRepository.findById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found"));

        if (product.getSessionStatus() != EventProductSessionStatus.ACTIVE) {
            throw new BusinessException("Phiên đấu giá không hoạt động");
        }

        // Check existing bid
        Optional<SealedBid> existingBid = sealedBidRepository.findByEventProductIdAndUserId(eventProductId, userId);
        SealedBid bid;
        if (existingBid.isPresent()) {
            bid = existingBid.get();
            bid.setBidAmount(bidAmount);
            bid.setUpdatedAt(LocalDateTime.now());
        } else {
            bid = new SealedBid();
            bid.setEventProductId(eventProductId);
            bid.setUserId(userId);
            bid.setBidAmount(bidAmount);
            bid.setSubmittedAt(LocalDateTime.now());
            bid.setRevealed(false);
        }

        return sealedBidRepository.save(bid);
    }

    @Override
    @Transactional
    public void reveal(Long eventProductId) {
        EventProduct product = eventProductRepository.findById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found"));

        // Check if already revealed
        if (product.getSessionStatus() == EventProductSessionStatus.ENDED_SOLD
                || product.getSessionStatus() == EventProductSessionStatus.ENDED_UNSOLD) {
            log.info("Event product {} already ended", eventProductId);
            return;
        }

        // Mark all bids as revealed
        List<SealedBid> bids = sealedBidRepository.findByEventProductId(eventProductId);
        bids.forEach(b -> b.setRevealed(true));
        sealedBidRepository.saveAll(bids);

        // Determine winner
        if (bids.isEmpty()) {
            product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
            eventProductRepository.save(product);
            return;
        }

        // Find highest bid, then earliest submitted
        SealedBid winner = bids.stream()
                .sorted(Comparator.comparing(SealedBid::getBidAmount).reversed()
                        .thenComparing(SealedBid::getSubmittedAt))
                .findFirst()
                .orElse(null);

        if (winner == null) {
            product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
            eventProductRepository.save(product);
            return;
        }

        // Check reserve price
        if (product.getReservePrice() != null && winner.getBidAmount() < product.getReservePrice()) {
            product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
            eventProductRepository.save(product);
            return;
        }

        product.setSessionStatus(EventProductSessionStatus.ENDED_SOLD);
        product.setWinnerId(winner.getUserId());
        product.setFinalPrice(winner.getBidAmount());
        eventProductRepository.save(product);

        eventNotificationService.notifyEventEnded(product.getEventId(), winner.getUserId(), true);
    }

    @Override
    public Optional<EventProductResponse> getRevealResult(Long eventProductId) {
        EventProduct product = eventProductRepository.findById(eventProductId).orElse(null);
        if (product == null) {
            return Optional.empty();
        }

        // Check if ended
        if (product.getSessionStatus() != EventProductSessionStatus.ENDED_SOLD
                && product.getSessionStatus() != EventProductSessionStatus.ENDED_UNSOLD) {
            return Optional.empty();
        }

        return Optional.of(EventProductResponse.fromEntity(product));
    }
}
