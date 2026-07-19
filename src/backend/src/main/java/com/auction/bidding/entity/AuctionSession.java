package com.auction.bidding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "Auctions")
public class AuctionSession {
    @Id
    @Column(name = "AuctionId")
    private Long auctionId;

    @Column(name = "ProductId", nullable = false)
    private Long productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "AuctionMode", length = 10)
    private AuctionMode auctionMode = AuctionMode.TIMED;

    @Column(name = "ScheduledDurationSeconds")
    private Long scheduledDurationSeconds;

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

    @Column(name = "PaymentStatus", length = 20)
    private String paymentStatus;

    @Column(name = "PaymentDeadline")
    private LocalDateTime paymentDeadline;

    @Column(name = "SettledAt")
    private LocalDateTime settledAt;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public AuctionMode getAuctionMode() { return auctionMode; }
    public void setAuctionMode(AuctionMode auctionMode) { this.auctionMode = auctionMode; }
    public Long getScheduledDurationSeconds() { return scheduledDurationSeconds; }
    public void setScheduledDurationSeconds(Long scheduledDurationSeconds) { this.scheduledDurationSeconds = scheduledDurationSeconds; }
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
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public LocalDateTime getPaymentDeadline() { return paymentDeadline; }
    public void setPaymentDeadline(LocalDateTime paymentDeadline) { this.paymentDeadline = paymentDeadline; }
    public LocalDateTime getSettledAt() { return settledAt; }
    public void setSettledAt(LocalDateTime settledAt) { this.settledAt = settledAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
