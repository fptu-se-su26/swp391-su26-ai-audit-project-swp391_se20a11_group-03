package com.example.biddingmodule.dto;

import com.example.biddingmodule.entity.AuctionStatus;

import java.time.LocalDateTime;

public class AuctionSessionDto {
    private Long auctionId;
    private Long productId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long currentHighestBid;
    private Long currentWinnerUserId;
    private AuctionStatus status;

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
    public Long getCurrentHighestBid() { return currentHighestBid; }
    public void setCurrentHighestBid(Long currentHighestBid) { this.currentHighestBid = currentHighestBid; }
    public Long getCurrentWinnerUserId() { return currentWinnerUserId; }
    public void setCurrentWinnerUserId(Long currentWinnerUserId) { this.currentWinnerUserId = currentWinnerUserId; }
    public AuctionStatus getStatus() { return status; }
    public void setStatus(AuctionStatus status) { this.status = status; }
}
