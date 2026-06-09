package com.swp391.service;

import com.swp391.dto.*;
import java.util.List;

/**
 * @author Pham Manh Thang
 */
public interface ProductService {
    List<ProductResponseDTO> getPendingProducts();
    ProductResponseDTO getProductById(Long productId);
    ProductResponseDTO approveProduct(Long productId, ProductApprovalRequestDTO request, Long reviewerId);
    ProductResponseDTO rejectProduct(Long productId, ProductApprovalRequestDTO request, Long reviewerId);

    ProductResponseDTO createProduct(CreateProductRequestDTO request, Long sellerId);
    List<ProductResponseDTO> getProductsBySellerId(Long sellerId);
}

