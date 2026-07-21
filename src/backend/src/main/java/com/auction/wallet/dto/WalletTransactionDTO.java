package com.auction.wallet.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalletTransactionDTO {
    private Long transactionId;
    private Long walletId;
    private Long userId;
    private String userName;
    private String transactionType;
    private String transactionTypeLabel;
    private Long amount;
    private Long signedAmount;
    private String direction;
    private String status;
    private String referenceCode;
    private String description;
    private String rejectionReason;
    private String createdAt;
}
