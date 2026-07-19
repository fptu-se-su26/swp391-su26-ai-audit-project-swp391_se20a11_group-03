package com.auction.product.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeaturedProductSlotDTO {
    private Integer displayOrder;
    private Long productId;
    private ProductSummaryResponse product;
}
