package com.auction.wallet.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WithdrawalResponse {
    private Long id;
    private Long userId;
    private String userName;
    private Long amount;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private String status;
    private String staffNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
