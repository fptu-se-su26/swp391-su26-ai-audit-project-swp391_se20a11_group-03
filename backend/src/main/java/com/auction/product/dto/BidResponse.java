package com.auction.product.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BidResponse {
    private Long bidId;
    private Long userId;
    private String bidderName;
    private BigDecimal bidAmount;
    private LocalDateTime bidTime;
}
