package com.auction.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionOverviewItemDTO {
    private Long auctionId;
    private Long productId;
    private String productName;
    private String sellerName;
    private String status;
    private String paymentStatus;
    private long currentBid;
    private String startTime;
    private String endTime;
    private Long totalBids;
}
