package com.auction.product.service;

import com.auction.product.dto.*;
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

