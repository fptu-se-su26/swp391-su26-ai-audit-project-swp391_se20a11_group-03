package com.hoangxuananhtuan.auction.dto;

import lombok.Data;

@Data
public class WalletTopUpRequestCreateRequest {
    private Long userId;
    private Long amount;
    private String paymentMethod;
    private String referenceCode;
}
