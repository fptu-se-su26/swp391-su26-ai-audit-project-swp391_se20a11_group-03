package com.swp391.service;

import com.swp391.dto.ProductApprovalRequestDTO;
import com.swp391.dto.ProductResponseDTO;

import java.util.List;

/**
 * @author Pham Manh Thang
 */
public interface ProductService {
    List<ProductResponseDTO> getPendingProducts();
    ProductResponseDTO getProductById(Long productId);
    ProductResponseDTO approveProduct(Long productId, ProductApprovalRequestDTO request, Long reviewerId);
    ProductResponseDTO rejectProduct(Long productId, ProductApprovalRequestDTO request, Long reviewerId);
}
