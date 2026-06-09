package com.hoangxuananhtuan.auction.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BidResponse {
    private Long bidId;
    private Long userId;
    private String bidderName;
    private Long bidAmount;
    private LocalDateTime bidTime;
}
