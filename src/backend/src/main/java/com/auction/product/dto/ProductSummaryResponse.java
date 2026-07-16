package com.auction.product.dto;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class ProductSummaryResponse {
    private Long productId;
    private String productName;
    private Long categoryId;
    private String categoryName;
    private Long startingPrice;
    private Long currentBid;
    private String status;
    private String imageUrl;
    private Long auctionId;
    private Long totalBids;
    private String auctionStatus;
    private String auctionStartTime;
    private String auctionEndTime;
    private String auctionMode;
    private Long scheduledDurationSeconds;
    private String rejectionReason;
}
