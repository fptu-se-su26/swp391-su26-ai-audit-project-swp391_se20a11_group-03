package com.auction.bidding.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuctionPaymentResponse {
    private Long auctionId;
    private Long productId;
    private Long finalPrice;
    private Long depositApplied;
    private Long amountCharged;
    private Long walletBalance;
    private Long walletHoldBalance;
    private String paymentStatus;
    private String message;
}
