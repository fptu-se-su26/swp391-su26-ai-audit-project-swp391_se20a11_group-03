package com.auction.bidding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BidRecordResponse {
    private Long bidId;
    private Long auctionId;
    private Long userId;
    private String username;
    private Long bidAmount;
    private LocalDateTime bidTime;
}
