package com.auction.product.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.product.dto.*;
import com.auction.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Pham Manh Thang
 */
@RestController
@RequestMapping({"/products", "/api/seller/products"})
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponseDTO>> createProduct(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody CreateProductRequestDTO request) {
        ProductResponseDTO created = productService.createProduct(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", created));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<ProductSummaryResponse>>> getMyProducts(
            @AuthenticationPrincipal UserDetailsImpl user) {
        List<ProductSummaryResponse> products = productService.getProductsBySellerId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/by-seller/{sellerId}")
    public ResponseEntity<ApiResponse<List<ProductSummaryResponse>>> getProductsBySeller(
            @PathVariable("sellerId") Long sellerId) {
        List<ProductSummaryResponse> products = productService.getProductsBySellerId(sellerId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> getProductById(@PathVariable("productId") Long productId) {
        ProductResponseDTO product = productService.getProductById(productId);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable("productId") Long productId,
            @AuthenticationPrincipal UserDetailsImpl user) {
        productService.deleteProduct(productId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> updateProduct(
            @PathVariable("productId") Long productId,
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody UpdateProductRequestDTO request) {
        ProductResponseDTO updated = productService.updateProduct(productId, request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", updated));
    }
}

