package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.entity.SealedBid;
import com.auction.event.enums.EventMoneyMode;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.enums.EventRegistrationStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.EventRegistrationRepository;
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
    private final EventRegistrationRepository registrationRepository;
    private final EventBidWalletService eventBidWalletService;
    private final EventNotificationService eventNotificationService;

    @Override
    @Transactional
    public SealedBid submitBid(Long eventProductId, Long userId, Long bidAmount) {
        if (bidAmount == null || bidAmount <= 0) {
            throw new BusinessException("Giá đặt phải lớn hơn 0");
        }
        EventProduct product = eventProductRepository.findLockedById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found"));

        if (product.getSessionStatus() != EventProductSessionStatus.ACTIVE) {
            throw new BusinessException("Phiên đấu giá không hoạt động");
        }

        if (product.getSubmittedBySellerId() != null && product.getSubmittedBySellerId().equals(userId)) {
            throw new BusinessException("Người bán không thể đặt giá sản phẩm của chính mình");
        }

        boolean registered = registrationRepository.findByEventIdAndUserId(product.getEventId(), userId)
                .map(r -> r.getStatus() == EventRegistrationStatus.REGISTERED)
                .orElse(false);
        if (!registered) {
            throw new BusinessException("Bạn cần đăng ký tham gia sự kiện trước khi đặt giá");
        }

        // Check existing bid
        Optional<SealedBid> existingBid = sealedBidRepository.findByEventProductIdAndUserId(eventProductId, userId);
        long oldAmount = existingBid.map(b -> b.getBidAmount() == null ? 0L : b.getBidAmount()).orElse(0L);

        // REAL money: each sealed bid holds its own (hidden) amount; releasing the
        // bidder's previous hold if they revise. Losers are released at reveal().
        AuctionEvent event = eventRepository.findById(product.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
        if (event.getMoneyMode() == EventMoneyMode.REAL) {
            eventBidWalletService.applySealedHold(userId, bidAmount, oldAmount, eventProductId);
        }

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
        EventProduct product = eventProductRepository.findLockedById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found"));

        // Check if already revealed
        if (product.getSessionStatus() == EventProductSessionStatus.ENDED_SOLD
                || product.getSessionStatus() == EventProductSessionStatus.ENDED_UNSOLD) {
            log.info("Event product {} already ended", eventProductId);
            return;
        }

        boolean realMoney = eventRepository.findById(product.getEventId())
                .map(e -> e.getMoneyMode() == EventMoneyMode.REAL)
                .orElse(false);

        // Mark all bids as revealed
        List<SealedBid> bids = sealedBidRepository.findByEventProductId(eventProductId);
        bids.forEach(b -> b.setRevealed(true));
        sealedBidRepository.saveAll(bids);

        // Find highest bid, then earliest submitted
        SealedBid winner = bids.stream()
                .filter(b -> b.getBidAmount() != null)
                .sorted(Comparator.comparing(SealedBid::getBidAmount).reversed()
                        .thenComparing(SealedBid::getSubmittedAt))
                .findFirst()
                .orElse(null);

        boolean sold = winner != null
                && (product.getReservePrice() == null || winner.getBidAmount() >= product.getReservePrice());

        if (!sold) {
            // No winner (empty / below reserve) — release every held bid.
            if (realMoney) {
                releaseSealedHolds(bids, null, eventProductId);
            }
            product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
            eventProductRepository.save(product);
            return;
        }

        // REAL money: release all losers; the winner's hold stays until payment.
        if (realMoney) {
            releaseSealedHolds(bids, winner.getUserId(), eventProductId);
            product.setHeldAmount(winner.getBidAmount());
        }

        product.setSessionStatus(EventProductSessionStatus.ENDED_SOLD);
        product.setWinnerId(winner.getUserId());
        product.setFinalPrice(winner.getBidAmount());
        product.setPaymentStatus("AWAITING_PAYMENT");
        product.setPaymentDeadline(LocalDateTime.now().plusHours(72));
        eventProductRepository.save(product);

        eventNotificationService.notifyEventEnded(product.getEventId(), winner.getUserId(), true);
    }

    /** Releases every sealed bidder's wallet hold except {@code keepUserId} (the winner). */
    private void releaseSealedHolds(List<SealedBid> bids, Long keepUserId, Long eventProductId) {
        for (SealedBid b : bids) {
            if (keepUserId != null && keepUserId.equals(b.getUserId())) {
                continue;
            }
            long amount = b.getBidAmount() == null ? 0L : b.getBidAmount();
            eventBidWalletService.releaseHold(b.getUserId(), amount, eventProductId,
                    "Hoàn tiền đặt giá kín (không thắng) sản phẩm " + eventProductId);
        }
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
