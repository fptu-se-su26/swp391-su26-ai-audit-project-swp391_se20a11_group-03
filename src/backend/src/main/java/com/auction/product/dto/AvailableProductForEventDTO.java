package com.auction.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AvailableProductForEventDTO {
    private Long productId;
    private String productName;
    private Long sellerId;
    private Long startingPrice;
    private Long stepPrice;
}
