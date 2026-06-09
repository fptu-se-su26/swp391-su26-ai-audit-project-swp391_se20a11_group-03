package com.hoangxuananhtuan.auction.dto;

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
    private String status;
}
