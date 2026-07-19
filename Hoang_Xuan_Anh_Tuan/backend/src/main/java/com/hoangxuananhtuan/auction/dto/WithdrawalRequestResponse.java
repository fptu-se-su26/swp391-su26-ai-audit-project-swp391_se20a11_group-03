package com.hoangxuananhtuan.auction.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WithdrawalRequestResponse {
    private Long withdrawalRequestId;
    private Long walletId;
    private Long userId;
    private Long amount;
    private String bankAccount;
    private String bankName;
    private String accountHolder;
    private String status;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private String message;
}
