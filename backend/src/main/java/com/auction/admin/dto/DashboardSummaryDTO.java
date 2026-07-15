package com.auction.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private long totalUsers;
    private long totalProducts;
    private long totalAuctions;
    private long activeAuctions;
    private long totalRevenue;        // platform commission + forfeited deposits (admin earnings)
    private long totalTopUps;         // sum of completed DEPOSIT (SePay)
    private long depositsHeld;        // live sum of LOCKED / HELD_FOR_PAYMENT auction deposits
    private long pendingWithdrawals;  // count of WITHDRAWAL with status PENDING
    private long adminBalance;        // current balance of the platform admin wallet
}
