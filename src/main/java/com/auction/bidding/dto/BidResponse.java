package com.example.biddingmodule.dto;

import java.time.LocalDateTime;

public class BidResponse {
    private boolean success;
    private String message;
    private Long auctionId;
    private Long userId;
    private Long bidAmount;
    private Long currentHighestBid;
    private LocalDateTime endTime;

    public static BidResponse success(Long auctionId, Long userId, Long bidAmount, Long currentHighestBid, LocalDateTime endTime) {
        BidResponse response = new BidResponse();
        response.success = true;
        response.message = "OK";
        response.auctionId = auctionId;
        response.userId = userId;
        response.bidAmount = bidAmount;
        response.currentHighestBid = currentHighestBid;
        response.endTime = endTime;
        return response;
    }

    public static BidResponse fail(String message) {
        BidResponse response = new BidResponse();
        response.success = false;
        response.message = message;
        return response;
    }

    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public Long getAuctionId() { return auctionId; }
    public Long getUserId() { return userId; }
    public Long getBidAmount() { return bidAmount; }
    public Long getCurrentHighestBid() { return currentHighestBid; }
    public LocalDateTime getEndTime() { return endTime; }
}

