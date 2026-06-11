package com.auction.bidding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "Auctions", schema = "dbo")
public class AuctionSession {
    @Id
    @Column(name = "AuctionId")
    private Long auctionId;

    @Column(name = "ProductId", nullable = false)
    private Long productId;

    @Column(name = "StartTime", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "EndTime", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "CurrentHighestBid", nullable = false)
    private Long currentHighestBid = 0L;

    @Column(name = "CurrentWinnerUserId")
    private Long currentWinnerUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private AuctionStatus status;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

