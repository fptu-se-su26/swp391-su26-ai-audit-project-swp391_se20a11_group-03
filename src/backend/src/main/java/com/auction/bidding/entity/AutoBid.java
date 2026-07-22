package com.auction.bidding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(name = "AutoBids", uniqueConstraints = @UniqueConstraint(columnNames = {"AuctionId", "UserId"}))
public class AutoBid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AutoBidId")
    private Long autoBidId;

    @Column(name = "AuctionId", nullable = false)
    private Long auctionId;

    @Column(name = "UserId", nullable = false)
    private Long userId;

    @Column(name = "MaxBidAmount", nullable = false)
    private Long maxBidAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false, length = 20)
    private AutoBidStatus status = AutoBidStatus.ACTIVE;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    public Long getAutoBidId() { return autoBidId; }
    public void setAutoBidId(Long autoBidId) { this.autoBidId = autoBidId; }
    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getMaxBidAmount() { return maxBidAmount; }
    public void setMaxBidAmount(Long maxBidAmount) { this.maxBidAmount = maxBidAmount; }
    public AutoBidStatus getStatus() { return status; }
    public void setStatus(AutoBidStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
