package com.swp391.controller;

import com.swp391.dto.*;
import com.swp391.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author Pham Manh Thang
 */
@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponseDTO>> createProduct(@Valid @RequestBody CreateProductRequestDTO request) {
        // TODO: Replace with actual authenticated user ID from Spring Security
        Long sellerId = 1L;
        ProductResponseDTO created = productService.createProduct(request, sellerId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", created));
    }

    @GetMapping("/my-products")
    public ResponseEntity<ApiResponse<List<ProductResponseDTO>>> getMyProducts() {
        // TODO: Replace with actual authenticated user ID from Spring Security
        Long sellerId = 1L;
        List<ProductResponseDTO> products = productService.getProductsBySellerId(sellerId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponseDTO>> getProductById(@PathVariable Long productId) {
        ProductResponseDTO product = productService.getProductById(productId);
        return ResponseEntity.ok(ApiResponse.success(product));
    }
}

