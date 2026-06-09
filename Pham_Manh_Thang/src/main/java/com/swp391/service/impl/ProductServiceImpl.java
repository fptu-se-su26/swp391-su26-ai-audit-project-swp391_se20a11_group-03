package com.swp391.service.impl;

import com.swp391.dto.*;
import com.swp391.entity.*;
import com.swp391.exception.BusinessException;
import com.swp391.exception.ResourceNotFoundException;
import com.swp391.repository.*;
import com.swp391.service.ContractService;
import com.swp391.service.EmailService;
import com.swp391.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * @author Pham Manh Thang
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private static final String ADMIN_NOTIFICATION_EMAIL = "binbin233444@gmail.com";
    private static final String SELLER_NOTIFICATION_EMAIL = "thuhuongiuudau1@gmail.com";

    private final ProductRepository productRepository;
    private final ProductApprovalRepository productApprovalRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;
    private final UserRepository userRepository;
    private final ContractService contractService;
    private final EmailService emailService;

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

        if (!userRepository.existsById(reviewerId)) {
            throw new ResourceNotFoundException("Reviewer not found with id: " + reviewerId);
        }

        product.setStatus("APPROVED");
        product.setRejectionReason(null);
        product = productRepository.save(product);

        saveApprovalHistory(product, reviewerId, "APPROVED", request.getReason(), request.getApprovalNote());

        // Create listing contract
        contractService.createListingContract(productId, reviewerId);

        // Generate PDF and send emails
        byte[] pdfBytes = contractService.generateListingContractPdf(productId);
        
        sendApprovalNotifications(product, productId, pdfBytes);

        // TODO: Integrate AuctionService after merge

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

        if (!userRepository.existsById(reviewerId)) {
            throw new ResourceNotFoundException("Reviewer not found with id: " + reviewerId);
        }

        product.setStatus("REJECTED");
        product.setRejectionReason(request.getReason());
        product = productRepository.save(product);

        saveApprovalHistory(product, reviewerId, "REJECTED", request.getReason(), request.getApprovalNote());

        sendRejectionNotification(product, productId, request.getReason());

        return convertToDTO(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO createProduct(CreateProductRequestDTO request, Long sellerId) {
        // Verify category exists and is active
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new BusinessException("Category is not active");
        }

        // Verify user exists
        if (!userRepository.existsById(sellerId)) {
            throw new ResourceNotFoundException("Seller not found with id: " + sellerId);
        }

        // Create product
        Product product = new Product();
        product.setSellerId(sellerId);
        product.setCategoryId(request.getCategoryId());
        product.setProductName(request.getProductName());
        product.setDescription(request.getDescription());
        product.setStartingPrice(request.getStartingPrice());
        product.setStepPrice(request.getStepPrice() != null ? request.getStepPrice() : 1000000L);
        product.setTaxPercent(request.getTaxPercent() != null ? request.getTaxPercent() : 5);
        product.setStatus("PENDING");
        product.setSubmittedAt(LocalDateTime.now());
        product.setCreatedAt(LocalDateTime.now());
        product = productRepository.save(product);

        // Create product images
        List<ProductImage> images = new ArrayList<>();
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            for (var imgDTO : request.getImages()) {
                ProductImage img = new ProductImage();
                img.setProductId(product.getProductId());
                img.setImageUrl(imgDTO.getImageUrl());
                img.setIsPrimary(imgDTO.getIsPrimary() != null ? imgDTO.getIsPrimary() : false);
                images.add(productImageRepository.save(img));
            }
        }

        // Validate and create product attributes
        List<ProductAttributeValue> attributes = new ArrayList<>();
        if (request.getAttributes() != null && !request.getAttributes().isEmpty()) {
            List<CategoryAttribute> categoryAttributes = categoryAttributeRepository.findByCategoryId(request.getCategoryId());
            for (var attrDTO : request.getAttributes()) {
                // Validate attribute belongs to category
                CategoryAttribute ca = categoryAttributes.stream()
                        .filter(a -> a.getAttributeId().equals(attrDTO.getAttributeId()))
                        .findFirst()
                        .orElseThrow(() -> new BusinessException("Attribute ID " + attrDTO.getAttributeId() + " is not valid for this category"));

                ProductAttributeValue pav = new ProductAttributeValue();
                pav.setProductId(product.getProductId());
                pav.setAttributeId(attrDTO.getAttributeId());
                pav.setAttributeValue(attrDTO.getAttributeValue());
                attributes.add(productAttributeValueRepository.save(pav));
            }
        }

        // Check required attributes are present
        checkRequiredAttributes(request.getCategoryId(), attributes);

        return convertToDTO(product);
    }

    @Override
    public List<ProductResponseDTO> getProductsBySellerId(Long sellerId) {
        return productRepository.findBySellerId(sellerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private void saveApprovalHistory(Product product, Long reviewerId, String status, String reason, String approvalNote) {
        ProductApproval approval = new ProductApproval();
        approval.setProductId(product.getProductId());
        approval.setReviewedBy(reviewerId);
        approval.setStatus(status);
        approval.setReason(reason);
        approval.setApprovalNote(approvalNote);
        approval.setReviewedAt(LocalDateTime.now());
        productApprovalRepository.save(approval);
    }

    private void sendApprovalNotifications(Product product, Long productId, byte[] pdfBytes) {
        try {
            emailService.sendListingContractEmail(ADMIN_NOTIFICATION_EMAIL, productId, pdfBytes);
        } catch (Exception e) {
            log.warn("Failed to send approval contract email to admin {} for product {}", ADMIN_NOTIFICATION_EMAIL, productId, e);
        }

        try {
            emailService.sendProductApprovalEmail(SELLER_NOTIFICATION_EMAIL, productId, product.getProductName());
        } catch (Exception e) {
            log.warn("Failed to send approval email to seller {} for product {}", SELLER_NOTIFICATION_EMAIL, productId, e);
        }

        try {
            emailService.sendListingContractEmail(SELLER_NOTIFICATION_EMAIL, productId, pdfBytes);
        } catch (Exception e) {
            log.warn("Failed to send contract email to seller {} for product {}", SELLER_NOTIFICATION_EMAIL, productId, e);
        }
    }

    private void sendRejectionNotification(Product product, Long productId, String reason) {
        try {
            emailService.sendProductRejectionEmail(SELLER_NOTIFICATION_EMAIL, productId, product.getProductName(), reason);
        } catch (Exception e) {
            log.warn("Failed to send rejection email to seller {} for product {}", SELLER_NOTIFICATION_EMAIL, productId, e);
        }

        try {
            emailService.sendProductRejectionEmail(ADMIN_NOTIFICATION_EMAIL, productId, product.getProductName(), reason);
        } catch (Exception e) {
            log.warn("Failed to send rejection email to admin {} for product {}", ADMIN_NOTIFICATION_EMAIL, productId, e);
        }
    }

    private void checkRequiredAttributes(Integer categoryId, List<ProductAttributeValue> productAttributes) {
        List<CategoryAttribute> requiredAttributes = categoryAttributeRepository.findByCategoryId(categoryId)
                .stream()
                .filter(CategoryAttribute::getIsRequired)
                .toList();

        for (CategoryAttribute required : requiredAttributes) {
            boolean present = productAttributes.stream()
                    .anyMatch(pav -> pav.getAttributeId().equals(required.getAttributeId()));
            if (!present) {
                throw new BusinessException("Missing required attribute: " + required.getAttributeName());
            }
        }
    }

    private ProductResponseDTO convertToDTO(Product product) {
        List<ProductImage> images = productImageRepository.findByProductId(product.getProductId());
        List<ProductAttributeValue> attributes = productAttributeValueRepository.findByProductId(product.getProductId());

        List<ProductImageDTO> imgDTOs = images.stream()
                .map(img -> new ProductImageDTO(img.getImageId(), img.getImageUrl(), img.getIsPrimary()))
                .toList();

        List<ProductAttributeValueDTO> attrDTOs = attributes.stream()
                .map(attr -> new ProductAttributeValueDTO(attr.getValueId(), attr.getAttributeId(), attr.getAttributeValue()))
                .toList();

        return new ProductResponseDTO(
                product.getProductId(),
                product.getSellerId(),
                product.getCategoryId(),
                product.getProductName(),
                product.getDescription(),
                product.getStartingPrice(),
                product.getStepPrice(),
                product.getTaxPercent(),
                product.getStatus(),
                product.getSubmittedAt(),
                product.getCreatedAt(),
                product.getRejectionReason(),
                imgDTOs,
                attrDTOs
        );
    }
}
