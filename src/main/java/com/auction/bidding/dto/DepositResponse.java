package com.auction.bidding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

