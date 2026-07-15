package com.auction.product.service;

import com.auction.product.dto.AdminFeaturedProductsResponse;
import com.auction.product.dto.FeaturedProductsResponse;
import com.auction.product.dto.UpdateFeaturedProductsRequest;

public interface FeaturedProductService {

    FeaturedProductsResponse getPublicFeaturedProducts();

    AdminFeaturedProductsResponse getAdminFeaturedProducts();

    void updateFeaturedProducts(UpdateFeaturedProductsRequest request, Long updatedByUserId);
}
