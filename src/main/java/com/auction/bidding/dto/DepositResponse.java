package com.hoangxuananhtuan.auction.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DepositResponse {
    private Long depositId;
    private Long auctionId;
    private Long userId;
    private Long depositAmount;
    private Long walletBalance;
    private Long walletHoldBalance;
    private String status;
    private String message;
}

