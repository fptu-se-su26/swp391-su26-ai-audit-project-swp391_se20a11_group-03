package com.hoangxuananhtuan.auction.dto;

import lombok.Data;

@Data
public class ProductSearchRequest {
    private String productName;
    private Long categoryId;
    private Long minStartingPrice;
    private Long maxStartingPrice;
    private Integer page = 0;
    private Integer size = 10;
}
