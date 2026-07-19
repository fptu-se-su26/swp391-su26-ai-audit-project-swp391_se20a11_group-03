package com.hoangxuananhtuan.auction.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long transactionId;
    private Long walletId;
    private Long userId;
    private Long amount;
    private Long signedAmount;
    private String amountLabel;
    private String transactionType;
    private String transactionTypeLabel;
    private String status;
    private String statusLabel;
    private String referenceCode;
    private String description;
    private LocalDateTime createdAt;
    private String createdAtLabel;
}
