package com.auction.bidding.service;

import com.auction.bidding.dto.AutoBidResponse;

public interface AutoBidService {
    AutoBidResponse setAutoBid(Long auctionId, Long userId, Long maxBidAmount);
    AutoBidResponse cancelAutoBid(Long auctionId, Long userId);
    AutoBidResponse getMyAutoBid(Long auctionId, Long userId);
}
