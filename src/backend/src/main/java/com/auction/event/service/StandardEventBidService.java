package com.auction.event.service;

import com.auction.event.dto.EventProductResponse;

public interface StandardEventBidService {
    EventProductResponse placeBid(Long eventProductId, Long userId, Long bidAmount);
}
