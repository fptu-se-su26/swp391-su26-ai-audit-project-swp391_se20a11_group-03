package com.swp391.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionReportItemDTO {
    private Long transactionId;
    private String username;
    private Long amount;
    private String transactionType;
    private String status;
    private LocalDateTime createdAt;
}
