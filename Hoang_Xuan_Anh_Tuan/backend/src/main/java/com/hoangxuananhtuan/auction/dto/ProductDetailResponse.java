package com.hoangxuananhtuan.auction.dto;

import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class ProductDetailResponse {
    private Long productId;
    private String productName;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long startingPrice;
    private String status;
    private AuctionResponse auction;
}
