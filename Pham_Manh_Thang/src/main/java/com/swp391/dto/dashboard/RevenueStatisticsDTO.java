package com.swp391.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatisticsDTO {
    private LocalDate from;
    private LocalDate to;
    private Long totalRevenue;
}
