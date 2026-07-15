package com.auction.bidding.service;

import com.auction.bidding.dto.AuctionPaymentResponse;

public interface AuctionPaymentService {
    AuctionPaymentResponse payAuction(Long auctionId, Long userId);
}
