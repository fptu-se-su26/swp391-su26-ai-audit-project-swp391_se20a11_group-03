package com.auction.wallet.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DepositQrResponse {
    private Long amount;
    private String bankId;
    private String bankAccount;
    private String accountName;
    private String content;
    private String qrUrl;
}
