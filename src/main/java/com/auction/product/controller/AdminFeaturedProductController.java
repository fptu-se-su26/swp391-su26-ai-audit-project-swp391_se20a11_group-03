package com.auction.product.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.product.dto.AdminFeaturedProductsResponse;
import com.auction.product.dto.UpdateFeaturedProductsRequest;
import com.auction.product.service.FeaturedProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/featured-products")
@RequiredArgsConstructor
public class AdminFeaturedProductController {

    private final FeaturedProductService featuredProductService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminFeaturedProductsResponse>> getFeaturedProducts() {
        return ResponseEntity.ok(ApiResponse.success(featuredProductService.getAdminFeaturedProducts()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<Void>> updateFeaturedProducts(
            @RequestBody UpdateFeaturedProductsRequest request,
            @AuthenticationPrincipal UserDetailsImpl user) {
        featuredProductService.updateFeaturedProducts(request, user != null ? user.getId() : null);
        return ResponseEntity.ok(ApiResponse.success("Featured products updated", null));
    }
}
