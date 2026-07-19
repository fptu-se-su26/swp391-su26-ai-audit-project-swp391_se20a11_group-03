package com.hoangxuananhtuan.auction.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalletResponse {
    private Long walletId;
    private Long userId;
    private Long balance;
    private Long holdBalance;
    private String status;
}
