package com.hoangxuananhtuan.auction.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AuctionResponse {
    private Long auctionId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private List<BidResponse> bids;
}
