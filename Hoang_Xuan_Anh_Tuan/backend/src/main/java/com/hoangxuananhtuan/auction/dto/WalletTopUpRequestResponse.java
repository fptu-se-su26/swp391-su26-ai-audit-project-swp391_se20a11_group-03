package com.hoangxuananhtuan.auction.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WalletTopUpRequestResponse {
    private Long topUpRequestId;
    private Long walletId;
    private Long userId;
    private Long amount;
    private String paymentMethod;
    private String referenceCode;
    private String status;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private String message;
}
