package com.hoangxuananhtuan.auction.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuctionEligibilityResponse {
    private Long auctionId;
    private Long productId;
    private boolean depositAllowed;
    private LocalDateTime startTime;
    private LocalDateTime depositDeadline;
    private String message;
}
