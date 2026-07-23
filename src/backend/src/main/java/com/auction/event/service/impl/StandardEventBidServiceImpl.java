package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.enums.BiddingMode;
import com.auction.event.enums.EventMoneyMode;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.enums.EventRegistrationStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.service.EventNotificationService;
import com.auction.event.service.StandardEventBidService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.concurrent.locks.ReentrantLock;

@Slf4j
@Service
@RequiredArgsConstructor
public class StandardEventBidServiceImpl implements StandardEventBidService {

    private final AuctionEventRepository eventRepository;
    private final EventProductRepository eventProductRepository;
    private final EventRegistrationRepository registrationRepository;
    private final EventBidWalletService eventBidWalletService;
    private final EventNotificationService eventNotificationService;
    private final ReentrantLock bidLock = new ReentrantLock(true);

    @Override
    @Transactional
    public EventProductResponse placeBid(Long eventProductId, Long userId, Long bidAmount) {
        if (bidAmount == null || bidAmount <= 0) {
            throw new BusinessException("Giá đặt phải lớn hơn 0");
        }
        bidLock.lock();
        try {
            EventProduct product = eventProductRepository.findLockedById(eventProductId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event product not found"));

            if (product.getSessionStatus() != EventProductSessionStatus.ACTIVE) {
                throw new BusinessException("Phiên đấu giá không hoạt động");
            }

            if (product.getSubmittedBySellerId() != null && product.getSubmittedBySellerId().equals(userId)) {
                throw new BusinessException("Người bán không thể đặt giá sản phẩm của chính mình");
            }

            requireRegistered(product.getEventId(), userId);

            AuctionEvent event = eventRepository.findById(product.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

            if (event.getBiddingMode() != BiddingMode.STANDARD) {
                throw new BusinessException("Loại đấu giá không hỗ trợ");
            }

            // Validate bid amount
            if (product.getCurrentPrice() == null) {
                if (bidAmount < product.getStartingPrice()) {
                    throw new BusinessException("Giá đặt phải ít nhất là giá khởi điểm: " + product.getStartingPrice());
                }
            } else {
                Long minBid = product.getPriceStep() != null ? product.getCurrentPrice() + product.getPriceStep() : product.getCurrentPrice() + 1;
                if (bidAmount < minBid) {
                    throw new BusinessException("Giá đặt phải ít nhất là: " + minBid);
                }
            }

            // REAL money: lock the new leading bid in the wallet and release the
            // previous leader's hold (reads product.winnerId/heldAmount as the old
            // leader BEFORE we overwrite them below).
            if (event.getMoneyMode() == EventMoneyMode.REAL) {
                eventBidWalletService.applyAscendingHold(product, userId, bidAmount);
            }

            // Update product
            product.setCurrentPrice(bidAmount);
            product.setWinnerId(userId);
            eventProductRepository.save(product);

            return EventProductResponse.fromEntity(product);
        } finally {
            bidLock.unlock();
        }
    }

    private void requireRegistered(Long eventId, Long userId) {
        boolean registered = registrationRepository.findByEventIdAndUserId(eventId, userId)
                .map(r -> r.getStatus() == EventRegistrationStatus.REGISTERED)
                .orElse(false);
        if (!registered) {
            throw new BusinessException("Bạn cần đăng ký tham gia sự kiện trước khi đặt giá");
        }
    }
}
