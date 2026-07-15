package com.auction.product.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AdminFeaturedProductsResponse {
    private List<FeaturedProductSlotDTO> daily;
    private List<FeaturedProductSlotDTO> weekly;
    private List<FeaturedProductSlotDTO> monthly;
}
