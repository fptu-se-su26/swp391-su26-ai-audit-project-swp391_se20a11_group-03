package com.auction.product.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProductDetailResponse {
    private Long productId;
    private String productName;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long sellerId;
    private Long startingPrice;
    private Long currentBid;
    private String status;
    private String imageUrl;
    private List<String> imageUrls;
    private String auctionMode;
    private Long scheduledDurationSeconds;
    private Long auctionId;
    private String auctionStatus;
    private String auctionStartTime;
    private String auctionEndTime;
    private String auctionPaymentStatus;
    private String auctionPaymentDeadline;
    private AuctionResponse auction;
}
