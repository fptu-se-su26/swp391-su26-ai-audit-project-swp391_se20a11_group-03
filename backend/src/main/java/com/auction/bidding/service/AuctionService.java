package com.auction.bidding.service;

import com.auction.bidding.dto.AuctionEligibilityResponse;

public interface AuctionService {
    AuctionEligibilityResponse getEligibility(Long auctionId, Long userId);
}

