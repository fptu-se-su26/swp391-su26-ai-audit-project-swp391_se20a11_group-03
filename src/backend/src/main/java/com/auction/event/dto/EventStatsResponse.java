package com.auction.event.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventStatsResponse {
    private Long totalBidders;
    private Long totalSellers;
    private Map<String, Long> productCountBySessionStatus;
    private Long totalSoldProducts;
    private Long totalFinalPrice;
    private Double soldRatio;
}
