package com.auction.bidding.dto;

public record AutoBidResponse(
        Long auctionId,
        Long maxBidAmount,
        String status,
        String message
) {
}
