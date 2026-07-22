package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.enums.BiddingMode;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
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
    private final EventNotificationService eventNotificationService;
    private final ReentrantLock bidLock = new ReentrantLock(true);

    @Override
    @Transactional
    public EventProductResponse placeBid(Long eventProductId, Long userId, Long bidAmount) {
        bidLock.lock();
        try {
            EventProduct product = eventProductRepository.findById(eventProductId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event product not found"));

            if (product.getSessionStatus() != EventProductSessionStatus.ACTIVE) {
                throw new BusinessException("Phiên đấu giá không hoạt động");
            }

            AuctionEvent event = eventRepository.findById(product.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

            if (event.getBiddingMode() != BiddingMode.STANDARD) {
                throw new BusinessException("Loại đấu giá không hỗ trợ");
            }

            // Check if registration is required
            if (event.getRegistrationDeadline() != null) {
                // TODO: Check if user is registered
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

            // Update product
            product.setCurrentPrice(bidAmount);
            product.setWinnerId(userId);
            eventProductRepository.save(product);

            return EventProductResponse.fromEntity(product);
        } finally {
            bidLock.unlock();
        }
    }
}
