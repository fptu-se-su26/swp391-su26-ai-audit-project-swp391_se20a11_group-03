package com.auction.product.dto;

import lombok.Data;

@Data
public class ProductSearchRequest {
    private String productName;
    private Integer categoryId;
    private Long minStartingPrice;
    private Long maxStartingPrice;
    private String status;
    private String auctionStatus;
    private Integer page = 0;
    private Integer size = 10;
}

