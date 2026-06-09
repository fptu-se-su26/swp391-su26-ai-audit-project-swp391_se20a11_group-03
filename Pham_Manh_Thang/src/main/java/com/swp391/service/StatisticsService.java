package com.swp391.service;

import com.swp391.dto.dashboard.DashboardSummaryDTO;
import com.swp391.dto.dashboard.RevenueStatisticsDTO;
import com.swp391.dto.dashboard.TransactionStatisticsDTO;

import java.time.LocalDate;

public interface StatisticsService {
    RevenueStatisticsDTO getRevenueStatistics(LocalDate from, LocalDate to);

    TransactionStatisticsDTO getTransactionStatistics(LocalDate from, LocalDate to);

    DashboardSummaryDTO getDashboardSummary();

    byte[] exportTransactionsToExcel(LocalDate from, LocalDate to);

    byte[] exportTransactionsToCsv(LocalDate from, LocalDate to);
}
