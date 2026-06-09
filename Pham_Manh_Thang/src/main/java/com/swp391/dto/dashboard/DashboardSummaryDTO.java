package com.swp391.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private Long totalRevenue;
    private Long totalTransactions;
    private Long successfulTransactions;
    private Long failedTransactions;
}
