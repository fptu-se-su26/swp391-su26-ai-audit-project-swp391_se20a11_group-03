package com.swp391.controller;

import com.swp391.dto.*;
import com.swp391.entity.User;
import com.swp391.repository.UserRepository;
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
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class ProductAdminController {

    private final ProductService productService;
    private final UserRepository userRepository;

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
        // Get first admin user as reviewer
        List<User> admins = userRepository.findByRole_RoleName("Admin");
        Long reviewerId = admins.isEmpty() ? 1L : admins.get(0).getUserId();
        ProductResponseDTO product = productService.approveProduct(productId, request, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Product approved successfully", product));
    }

    @PostMapping("/{productId}/reject")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> rejectProduct(
            @PathVariable Long productId,
            @Valid @RequestBody ProductApprovalRequestDTO request) {
        // Get first admin user as reviewer
        List<User> admins = userRepository.findByRole_RoleName("Admin");
        Long reviewerId = admins.isEmpty() ? 1L : admins.get(0).getUserId();
        ProductResponseDTO product = productService.rejectProduct(productId, request, reviewerId);
        return ResponseEntity.ok(ApiResponse.success("Product rejected successfully", product));
    }
}
