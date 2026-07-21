package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.dto.PennyConfig;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.entity.PennyBid;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.PennyBidRepository;
import com.auction.event.service.EventNotificationService;
import com.auction.event.service.PennyAuctionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantLock;

@Slf4j
@Service
@RequiredArgsConstructor
public class PennyAuctionServiceImpl implements PennyAuctionService {

    private final AuctionEventRepository eventRepository;
    private final EventProductRepository eventProductRepository;
    private final PennyBidRepository pennyBidRepository;
    private final EventNotificationService eventNotificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<Long, ReentrantLock> productLocks = new HashMap<>();

    @Override
    @Transactional
    public EventProductResponse placeBid(Long eventProductId, Long userId) {
        ReentrantLock lock = productLocks.computeIfAbsent(eventProductId, k -> new ReentrantLock(true));
        lock.lock();
        try {
            EventProduct product = eventProductRepository.findById(eventProductId)
                    .orElseThrow(() -> new ResourceNotFoundException("Event product not found"));

            if (product.getSessionStatus() != EventProductSessionStatus.ACTIVE) {
                throw new BusinessException("Phiên đấu giá không hoạt động");
            }

            AuctionEvent event = eventRepository.findById(product.getEventId())
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

            PennyConfig config = parsePennyConfig(event.getPennyConfigJson());
            if (config == null) {
                throw new BusinessException("Penny auction config not found");
            }

            LocalDateTime now = LocalDateTime.now();
            if (product.getSessionEnd() != null && !now.isBefore(product.getSessionEnd())) {
                throw new BusinessException("Phiên đấu giá đã kết thúc");
            }

            // Check max consecutive bids
            if (Boolean.TRUE.equals(config.getMaxConsecutiveBidsPerUser())) {
                Optional<PennyBid> lastBid = pennyBidRepository.findLastBidByEventProductId(eventProductId);
                if (lastBid.isPresent() && lastBid.get().getUserId().equals(userId)) {
                    throw new BusinessException("Bạn không thể đặt giá liên tiếp");
                }
            }

            // Calculate new price
            Long newPrice = product.getCurrentPrice() != null ? product.getCurrentPrice() + config.getBidStep() : product.getStartingPrice();

            // Create penny bid
            PennyBid pennyBid = new PennyBid();
            pennyBid.setEventProductId(eventProductId);
            pennyBid.setUserId(userId);
            pennyBid.setPriceAfterBid(newPrice);
            pennyBid.setBidAt(now);
            pennyBidRepository.save(pennyBid);

            // Update product
            product.setCurrentPrice(newPrice);
            // Reset timer
            if (config.getTimerResetSeconds() != null) {
                LocalDateTime newEnd = now.plusSeconds(config.getTimerResetSeconds());
                if (event.getEndTime() != null && newEnd.isAfter(event.getEndTime())) {
                    newEnd = event.getEndTime();
                }
                product.setSessionEnd(newEnd);
            }
            product = eventProductRepository.save(product);

            return EventProductResponse.fromEntity(product);
        } finally {
            lock.unlock();
        }
    }

    @Override
    public Map<String, Object> getPennyStatus(Long eventProductId) {
        EventProduct product = eventProductRepository.findById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found"));

        Map<String, Object> status = new HashMap<>();
        status.put("currentPrice", product.getCurrentPrice());
        status.put("sessionEnd", product.getSessionEnd());
        status.put("sessionStatus", product.getSessionStatus());

        if (product.getSessionEnd() != null) {
            long secondsLeft = Duration.between(LocalDateTime.now(), product.getSessionEnd()).getSeconds();
            status.put("secondsLeft", Math.max(0, secondsLeft));
        }

        // Number of bids
        List<PennyBid> bids = pennyBidRepository.findByEventProductId(eventProductId);
        status.put("totalBids", bids.size());

        return status;
    }

    private PennyConfig parsePennyConfig(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, PennyConfig.class);
        } catch (Exception e) {
            log.error("Error parsing Penny config JSON", e);
            return null;
        }
    }
}
