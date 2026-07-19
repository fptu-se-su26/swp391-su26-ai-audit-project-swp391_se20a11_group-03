package com.auction.product.controller;

import com.auction.product.dto.FeaturedProductsResponse;
import com.auction.product.service.FeaturedProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/featured-products")
@RequiredArgsConstructor
public class FeaturedProductController {

    private final FeaturedProductService featuredProductService;

    @GetMapping
    public ResponseEntity<FeaturedProductsResponse> getFeaturedProducts() {
        return ResponseEntity.ok(featuredProductService.getPublicFeaturedProducts());
    }
}
