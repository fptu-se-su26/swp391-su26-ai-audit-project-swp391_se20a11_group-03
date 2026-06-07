package com.swp391.controller;

import com.swp391.dto.*;
import com.swp391.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Pham Manh Thang
 */
@RestController
@RequestMapping("/admin/products")
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
            @Valid @RequestBody(required = false) ProductApprovalRequestDTO request) {
        if (request == null) {
            request = new ProductApprovalRequestDTO();
        }
        // TODO: Replace with actual authenticated user ID from Spring Security
        Long reviewerId = 1L;
        ProductResponseDTO product = productService.approveProduct(productId, request, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Product approved successfully", product));
    }

    @PostMapping("/{productId}/reject")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> rejectProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductApprovalRequestDTO request) {
        // TODO: Replace with actual authenticated user ID from Spring Security
        Long reviewerId = 1L;
        ProductResponseDTO product = productService.rejectProduct(productId, request, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Product rejected successfully", product));
    }
}
