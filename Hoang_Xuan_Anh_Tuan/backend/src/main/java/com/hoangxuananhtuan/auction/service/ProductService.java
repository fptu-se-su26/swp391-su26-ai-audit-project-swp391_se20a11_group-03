package com.hoangxuananhtuan.auction.service;

import com.hoangxuananhtuan.auction.dto.PageResponse;
import com.hoangxuananhtuan.auction.dto.ProductDetailResponse;
import com.hoangxuananhtuan.auction.dto.ProductSearchRequest;
import com.hoangxuananhtuan.auction.dto.ProductSummaryResponse;

public interface ProductService {
    PageResponse<ProductSummaryResponse> searchProducts(ProductSearchRequest request);
    ProductDetailResponse getProductDetail(Long productId);
}
