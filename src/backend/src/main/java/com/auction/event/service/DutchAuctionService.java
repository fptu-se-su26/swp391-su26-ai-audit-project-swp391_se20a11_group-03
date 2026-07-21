package com.auction.event.service;

import com.auction.event.dto.EventProductResponse;

public interface DutchAuctionService {
    Long getCurrentPrice(Long eventProductId);
    EventProductResponse commitPurchase(Long eventProductId, Long userId);
}
