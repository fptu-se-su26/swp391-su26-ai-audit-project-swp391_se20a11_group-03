package com.auction.bidding.dto;

public class BidRequest {
    private Long auctionId;
    private Long userId;
    private Long bidAmount;
    private String ipAddress;
    private String deviceHash;

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getBidAmount() { return bidAmount; }
    public void setBidAmount(Long bidAmount) { this.bidAmount = bidAmount; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getDeviceHash() { return deviceHash; }
    public void setDeviceHash(String deviceHash) { this.deviceHash = deviceHash; }
}

