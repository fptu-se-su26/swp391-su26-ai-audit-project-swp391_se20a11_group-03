package com.auction.event.service;

import com.auction.event.dto.EventProductResponse;

import java.util.Map;

public interface PennyAuctionService {
    EventProductResponse placeBid(Long eventProductId, Long userId);
    Map<String, Object> getPennyStatus(Long eventProductId);
}
