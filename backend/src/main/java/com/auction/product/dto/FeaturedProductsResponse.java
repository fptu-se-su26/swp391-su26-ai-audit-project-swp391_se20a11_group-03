package com.auction.product.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FeaturedProductsResponse {
    private List<ProductSummaryResponse> daily;
    private List<ProductSummaryResponse> weekly;
    private List<ProductSummaryResponse> monthly;
}
