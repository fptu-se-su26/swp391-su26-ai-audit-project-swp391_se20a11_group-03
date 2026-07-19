package com.auction.bidding.entity;

import com.auction.account.entity.User;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "Bids")
public class Bid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BidId")
    private Long bidId;

    @Column(name = "AuctionId", nullable = false)
    private Long auctionId;

    @Column(name = "UserId", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", insertable = false, updatable = false)
    private User user;

    @Column(name = "BidAmount", nullable = false)
    private Long bidAmount;

    @Column(name = "BidTime", nullable = false)
    private LocalDateTime bidTime;

    @Column(name = "IpAddress", length = 64)
    private String ipAddress;

    @Column(name = "DeviceHash", length = 64)
    private String deviceHash;

    public Long getBidId() { return bidId; }
    public void setBidId(Long bidId) { this.bidId = bidId; }
    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Long getBidAmount() { return bidAmount; }
    public void setBidAmount(Long bidAmount) { this.bidAmount = bidAmount; }
    public LocalDateTime getBidTime() { return bidTime; }
    public void setBidTime(LocalDateTime bidTime) { this.bidTime = bidTime; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getDeviceHash() { return deviceHash; }
    public void setDeviceHash(String deviceHash) { this.deviceHash = deviceHash; }
}

