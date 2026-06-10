package com.swp391.service;

import com.swp391.dto.dashboard.DashboardSummaryDTO;
import com.swp391.dto.dashboard.RevenueStatisticResponse;
import com.swp391.dto.dashboard.TransactionReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface StatisticsService {

    List<RevenueStatisticResponse> getRevenueStatistics(LocalDate from, LocalDate to);

    TransactionReportResponse getTransactionReport(LocalDate from, LocalDate to, int page, int size);

    DashboardSummaryDTO getDashboardSummary();

    byte[] exportTransactionsToExcel(LocalDate from, LocalDate to);

    byte[] exportTransactionsToCsv(LocalDate from, LocalDate to);
}
