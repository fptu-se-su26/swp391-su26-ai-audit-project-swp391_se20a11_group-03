package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.DutchConfig;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.service.DutchAuctionService;
import com.auction.event.service.EventNotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class DutchAuctionServiceImpl implements DutchAuctionService {

    private final AuctionEventRepository eventRepository;
    private final EventProductRepository eventProductRepository;
    private final EventNotificationService eventNotificationService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Long getCurrentPrice(Long eventProductId) {
        EventProduct product = eventProductRepository.findById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found"));
        AuctionEvent event = eventRepository.findById(product.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        DutchConfig config = parseDutchConfig(event.getDutchConfigJson());
        if (config == null) {
            throw new BusinessException("Dutch auction config not found");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = product.getSessionStart();
        if (start == null || now.isBefore(start)) {
            return product.getStartingPrice();
        }

        long elapsedSeconds = Duration.between(start, now).getSeconds();
        long drops = elapsedSeconds / config.getDropIntervalSeconds();
        long currentPrice = product.getStartingPrice() - (drops * config.getDropAmount());

        return Math.max(currentPrice, config.getFloorPrice());
    }

    @Override
    @Transactional
    public EventProductResponse commitPurchase(Long eventProductId, Long userId) {
        EventProduct product = eventProductRepository.findById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found"));

        if (product.getSessionStatus() != EventProductSessionStatus.ACTIVE) {
            if (product.getSessionStatus() == EventProductSessionStatus.ENDED_SOLD) {
                throw new BusinessException("Sản phẩm đã được mua");
            }
            throw new BusinessException("Phiên đấu giá không hoạt động");
        }

        // Calculate current price
        Long currentPrice = getCurrentPrice(eventProductId);

        // Update product
        product.setSessionStatus(EventProductSessionStatus.ENDED_SOLD);
        product.setWinnerId(userId);
        product.setFinalPrice(currentPrice);
        product = eventProductRepository.save(product);

        // Notify winner
        eventNotificationService.notifyEventEnded(product.getEventId(), userId, true);

        return EventProductResponse.fromEntity(product);
    }

    private DutchConfig parseDutchConfig(String json) {
        if (json == null || json.isBlank()) {
            return null;
        }
        try {
            return objectMapper.readValue(json, DutchConfig.class);
        } catch (Exception e) {
            log.error("Error parsing Dutch config JSON", e);
            return null;
        }
    }
}
