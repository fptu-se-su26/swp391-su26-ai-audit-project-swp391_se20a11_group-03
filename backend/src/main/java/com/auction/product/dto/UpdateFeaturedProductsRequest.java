package com.auction.product.dto;

import lombok.Data;

import java.util.List;

@Data
public class UpdateFeaturedProductsRequest {
    private String periodType;
    private List<Long> productIds;
}
