package com.swp391.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionReportResponse {
    private LocalDate from;
    private LocalDate to;
    private Long totalTransactions;
    private Long successfulTransactions;
    private Long failedTransactions;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private List<TransactionReportItemDTO> transactions;
}
