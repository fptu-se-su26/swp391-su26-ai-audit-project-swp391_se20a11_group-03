package com.hoangxuananhtuan.auction.dto;

import lombok.Data;

@Data
public class WithdrawalRequestCreateRequest {
    private Long userId;
    private Long amount;
    private String bankAccount;
    private String bankName;
    private String accountHolder;
}
