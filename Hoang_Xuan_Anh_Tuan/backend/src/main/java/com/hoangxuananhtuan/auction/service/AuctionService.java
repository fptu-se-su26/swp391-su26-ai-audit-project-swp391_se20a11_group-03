package com.hoangxuananhtuan.auction.service;

import com.hoangxuananhtuan.auction.dto.AuctionEligibilityResponse;

public interface AuctionService {
    AuctionEligibilityResponse getEligibility(Long auctionId, Long userId);
}
