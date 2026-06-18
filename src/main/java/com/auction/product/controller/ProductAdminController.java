package com.auction.product.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.product.dto.*;
import com.auction.product.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Pham Manh Thang
 */
@RestController
@RequestMapping({"/admin/products", "/api/admin/products"})
@RequiredArgsConstructor
public class ProductAdminController {

    private final ProductService productService;

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getPendingProducts() {
        List<ProductResponseDTO> products = productService.getPendingProducts();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> getProductById(@PathVariable Long productId) {
        ProductResponseDTO product = productService.getProductById(productId);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @PostMapping("/{productId}/approve")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> approveProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody(required = false) ProductApprovalRequestDTO request) {
        if (request == null) {
            request = new ProductApprovalRequestDTO();
        }
        ProductResponseDTO product = productService.approveProduct(productId, request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Product approved successfully", product));
    }

    @PostMapping("/{productId}/reject")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> rejectProduct(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody(required = false) ProductApprovalRequestDTO request) {
        if (request == null) {
            request = new ProductApprovalRequestDTO();
        }
        ProductResponseDTO product = productService.rejectProduct(productId, request, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Product rejected successfully", product));
    }
}

