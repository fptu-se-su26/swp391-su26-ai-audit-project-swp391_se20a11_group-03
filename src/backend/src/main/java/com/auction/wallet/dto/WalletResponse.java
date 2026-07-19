package com.auction.wallet.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalletResponse {
    private Long walletId;
    private Long userId;
    private Long balance;
    private Long holdBalance;
    /** Spendable balance (balance minus holds for deposits and pending withdrawals). */
    private Long availableBalance;
    private String status;
}
