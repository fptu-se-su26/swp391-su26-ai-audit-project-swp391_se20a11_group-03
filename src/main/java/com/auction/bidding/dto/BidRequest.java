package com.example.biddingmodule.dto;

public class BidRequest {
    private Long auctionId;
    private Long userId;
    private Long bidAmount;

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBidAmount() { return bidAmount; }
    public void setBidAmount(Long bidAmount) { this.bidAmount = bidAmount; }
}

