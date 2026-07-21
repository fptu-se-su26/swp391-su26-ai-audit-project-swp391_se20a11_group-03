package com.auction.event.service;

import com.auction.event.dto.EventProductResponse;
import com.auction.event.entity.SealedBid;

import java.util.List;
import java.util.Optional;

public interface SealedBidService {
    SealedBid submitBid(Long eventProductId, Long userId, Long bidAmount);
    void reveal(Long eventProductId);
    Optional<EventProductResponse> getRevealResult(Long eventProductId);
}
