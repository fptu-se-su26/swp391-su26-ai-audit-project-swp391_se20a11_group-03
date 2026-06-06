package com.swp391.service.impl;

import com.swp391.dto.ProductApprovalRequestDTO;
import com.swp391.dto.ProductResponseDTO;
import com.swp391.entity.Product;
import com.swp391.entity.ProductApproval;
import com.swp391.entity.User;
import com.swp391.exception.BusinessException;
import com.swp391.exception.ResourceNotFoundException;
import com.swp391.repository.ProductApprovalRepository;
import com.swp391.repository.ProductRepository;
import com.swp391.repository.UserRepository;
import com.swp391.service.ContractService;
import com.swp391.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Pham Manh Thang
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductApprovalRepository productApprovalRepository;
    private final UserRepository userRepository;
    private final ContractService contractService;

    @Override
    public List<ProductResponseDTO> getPendingProducts() {
        return productRepository.findByStatus("PENDING").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductResponseDTO getProductById(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        return convertToDTO(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO approveProduct(Long productId, ProductApprovalRequestDTO request, Long reviewerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        if (!"PENDING".equals(product.getStatus())) {
            throw new BusinessException("Product is already " + product.getStatus());
        }
        
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
        
        product.setStatus("APPROVED");
        product = productRepository.save(product);
        
        saveApprovalHistory(product, reviewer, "APPROVED", request.getReason());
        
        // Create listing contract
        contractService.createListingContract(productId);
        
        // TODO: Integrate AuctionService after merge to create auction
        // TODO: Integrate NotificationService after merge to notify seller
        
        return convertToDTO(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO rejectProduct(Long productId, ProductApprovalRequestDTO request, Long reviewerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
        
        if (!"PENDING".equals(product.getStatus())) {
            throw new BusinessException("Product is already " + product.getStatus());
        }
        
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer not found"));
        
        product.setStatus("REJECTED");
        product = productRepository.save(product);
        
        saveApprovalHistory(product, reviewer, "REJECTED", request.getReason());
        
        // TODO: Integrate NotificationService after merge to notify seller
        
        return convertToDTO(product);
    }

    private void saveApprovalHistory(Product product, User reviewer, String status, String reason) {
        ProductApproval approval = new ProductApproval();
        approval.setProduct(product);
        approval.setReviewedBy(reviewer);
        approval.setStatus(status);
        approval.setReason(reason);
        approval.setReviewedAt(LocalDateTime.now());
        productApprovalRepository.save(approval);
    }

    private ProductResponseDTO convertToDTO(Product product) {
        ProductResponseDTO dto = new ProductResponseDTO();
        dto.setProductId(product.getProductId());
        dto.setSellerId(product.getSeller().getUserId());
        dto.setSellerName(product.getSeller().getUsername());
        dto.setCategoryId(product.getCategory().getCategoryId());
        dto.setCategoryName(product.getCategory().getCategoryName());
        dto.setProductName(product.getProductName());
        dto.setDescription(product.getDescription());
        dto.setImagesUrl(product.getImagesUrl());
        dto.setCondition(product.getCondition());
        dto.setBrand(product.getBrand());
        dto.setOrigin(product.getOrigin());
        dto.setWeightSize(product.getWeightSize());
        dto.setStartingPrice(product.getStartingPrice());
        dto.setStepPrice(product.getStepPrice());
        dto.setStatus(product.getStatus());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setTaxPercent(product.getTaxPercent());
        return dto;
    }
}
