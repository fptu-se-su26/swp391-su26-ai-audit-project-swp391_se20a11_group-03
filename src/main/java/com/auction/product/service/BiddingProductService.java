package com.auction.product.service;

import com.auction.common.dto.PageResponse;
import com.auction.product.dto.ProductDetailResponse;
import com.auction.product.dto.ProductSearchRequest;
import com.auction.product.dto.ProductSummaryResponse;

public interface BiddingProductService {
    PageResponse<ProductSummaryResponse> searchProducts(ProductSearchRequest request);
    ProductDetailResponse getProductDetail(Long productId);
}

