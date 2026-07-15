package com.auction.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyRevenueDTO {
    private String date;   // yyyy-MM-dd
    private long amount;   // total revenue that day
    private long count;    // number of transactions that day
}
