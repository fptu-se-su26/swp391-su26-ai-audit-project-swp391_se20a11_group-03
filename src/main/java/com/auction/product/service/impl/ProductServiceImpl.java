package com.auction.product.service.impl;

import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionMode;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.service.AuctionCreationService;
import com.auction.bidding.util.StepCalculator;
import com.auction.bidding.service.impl.AuctionCreationServiceImpl;
import com.auction.product.dto.*;
import com.auction.product.entity.*;
import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.product.repository.*;
import com.auction.product.service.ContractService;
import com.auction.product.service.ProductService;
import com.auction.notification.service.NotificationService;
import com.auction.notification.entity.Notification;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author Pham Manh Thang
 */
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;
    private final ProductApprovalRepository productApprovalRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryAttributeRepository categoryAttributeRepository;
    private final com.auction.account.dao.UserRepository userRepository;
    private final ContractService contractService;
    private final AuctionRepository auctionRepository;
    private final AuctionCreationService auctionCreationService;
    private final NotificationService notificationService;

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

        if (!userRepository.existsById(Math.toIntExact(reviewerId))) {
            throw new ResourceNotFoundException("Reviewer not found with id: " + reviewerId);
        }

        product.setStatus("APPROVED");
        product.setRejectionReason(null);
        product = productRepository.save(product);

        saveApprovalHistory(product, reviewerId, "APPROVED", request.getReason());

        validateApprovalSchedule(request);

        product.setAuctionMode(request.getAuctionMode());
        product.setScheduledStartTime(request.getScheduledStartTime());
        product.setScheduledDurationSeconds(request.getScheduledDurationSeconds());
        product = productRepository.save(product);

        // Create listing contract (skip if product is being re-listed after forfeit)
        if (!contractService.hasListingContract(productId)) {
            contractService.createListingContract(productId, reviewerId);
        }

        AuctionMode mode = AuctionMode.valueOf(request.getAuctionMode());
        auctionCreationService.createForApprovedProduct(
                productId, mode, request.getScheduledStartTime(), request.getScheduledDurationSeconds());

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String startLabel = request.getScheduledStartTime().format(fmt);
        String scheduleDetail = "LIVE".equals(request.getAuctionMode())
                ? String.format("Phiên LIVE sẽ mở lúc %s.", startLabel)
                : String.format(
                        "Phiên TIMED sẽ mở lúc %s (thời lượng %d giờ).",
                        startLabel,
                        request.getScheduledDurationSeconds() / 3600);

        // Send notification to seller
        notificationService.createNotification(
                product.getSellerId().longValue(),
                "Sản phẩm đã được duyệt",
                "Sản phẩm \"" + product.getProductName() + "\" của bạn đã được duyệt. " + scheduleDetail,
                Notification.NotificationType.PRODUCT_APPROVED,
                productId,
                "PRODUCT"
        );

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

        if (!userRepository.existsById(Math.toIntExact(reviewerId))) {
            throw new ResourceNotFoundException("Reviewer not found with id: " + reviewerId);
        }

        product.setStatus("REJECTED");
        product.setRejectionReason(request.getReason());
        product = productRepository.save(product);

        saveApprovalHistory(product, reviewerId, "REJECTED", request.getReason());

        // Send notification to seller
        String reasonMsg = request.getReason() != null && !request.getReason().isBlank()
                ? " Lý do: " + request.getReason()
                : "";
        notificationService.createNotification(
                product.getSellerId().longValue(),
                "Sản phẩm bị từ chối",
                "Sản phẩm \"" + product.getProductName() + "\" của bạn đã bị từ chối." + reasonMsg,
                Notification.NotificationType.PRODUCT_REJECTED,
                productId,
                "PRODUCT"
        );

        return convertToDTO(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO createProduct(CreateProductRequestDTO request, Long sellerId) {
        log.info("[createProduct] sellerId={}, request={}", sellerId, request);
        try {
            // Verify category exists and is active
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            if (!Boolean.TRUE.equals(category.getIsActive())) {
                throw new BusinessException("Category is not active");
            }

            // Verify seller exists AND has completed KYC (Admin bypasses KYC + seller contract).
            com.auction.account.entity.User seller = userRepository.findById(Math.toIntExact(sellerId))
                    .orElseThrow(() -> new ResourceNotFoundException("Seller not found with id: " + sellerId));
            LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).toLocalDate().atStartOfDay();
            long monthlyListings = productRepository.countBySellerIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
                    sellerId, monthStart, monthStart.plusMonths(1));
            // Edge cases: deleted/rejected rows still count; month boundary is [start, nextStart).
            if (!seller.hasActivePremium() && monthlyListings >= 5) {
                throw new com.auction.common.exception.LimitExceededException(
                        "Tài khoản thường chỉ được đăng tối đa 5 sản phẩm/tháng");
            }
            boolean isAdmin = seller.getRole() != null && "Admin".equalsIgnoreCase(seller.getRole().getRoleName());
            if (!isAdmin) {
                if (!seller.isIdentityVerified()) {
                    throw new com.auction.common.exception.KycRequiredException(
                            "Bạn cần hoàn tất xác thực danh tính (KYC) trước khi đăng bán sản phẩm.");
                }
                if (!contractService.hasSellerContract(seller.getUserId())) {
                    throw new BusinessException(
                            "Bạn cần ký hợp đồng nền tảng (ở bước KYC) trước khi đăng bán sản phẩm.");
                }
            }

            // Validate auction scheduling fields if provided
            validateAuctionSchedule(request);

            // Validate required category attributes BEFORE saving anything
            validateCategoryAttributes(request.getCategoryId(), request.getAttributes());

            // Create product
            Product product = new Product();
            product.setSellerId(sellerId);
            product.setCategoryId(request.getCategoryId());
            product.setProductName(request.getProductName());
            product.setDescription(request.getDescription());
            product.setStartingPrice(normalizeStartingPrice(request.getStartingPrice()));
            product.setStepPrice(StepCalculator.calculate(product.getStartingPrice()));
            product.setTaxPercent(request.getTaxPercent() != null ? request.getTaxPercent() : 5);
            product.setStatus("PENDING");
            product.setAuctionMode(request.getAuctionMode());
            product.setScheduledStartTime(request.getScheduledStartTime());
            product.setScheduledDurationSeconds(request.getScheduledDurationSeconds());
            product.setSubmittedAt(LocalDateTime.now());
            product.setCreatedAt(LocalDateTime.now());
            product = productRepository.save(product);
            log.info("[createProduct] product saved with id={}", product.getProductId());

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

            checkRequiredAttributes(request.getCategoryId(), attributes);

            // Admin listings skip staff approval and go live on the scheduled timeline.
            if (isAdmin) {
                product.setStatus("APPROVED");
                product = productRepository.save(product);
                contractService.createListingContract(product.getProductId(), sellerId);
                if (product.getAuctionMode() != null) {
                    AuctionMode mode = AuctionMode.valueOf(product.getAuctionMode());
                    LocalDateTime startTime = product.getScheduledStartTime() != null
                            ? product.getScheduledStartTime()
                            : LocalDateTime.now().plusMinutes(AuctionCreationServiceImpl.MIN_LEAD_MINUTES);
                    auctionCreationService.createForApprovedProduct(
                            product.getProductId(), mode, startTime, product.getScheduledDurationSeconds());
                }
                log.info("[createProduct] admin product auto-approved productId={}", product.getProductId());
            }

            ProductResponseDTO dto = convertToDTO(product);
            log.info("[createProduct] success for productId={}", product.getProductId());
            return dto;
        } catch (BusinessException | ResourceNotFoundException ex) {
            log.warn("[createProduct] business validation failed: {}", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.error("[createProduct] unexpected error for sellerId={}, request={}", sellerId, request, ex);
            throw ex;
        }
    }

    private void validateApprovalSchedule(ProductApprovalRequestDTO request) {
        if (request.getAuctionMode() == null || request.getAuctionMode().isBlank()) {
            throw new BusinessException("auctionMode is required (LIVE or TIMED)");
        }
        if (!"LIVE".equals(request.getAuctionMode()) && !"TIMED".equals(request.getAuctionMode())) {
            throw new BusinessException("auctionMode must be LIVE or TIMED");
        }
        if (request.getScheduledStartTime() == null) {
            throw new BusinessException("scheduledStartTime is required");
        }
        LocalDateTime minStart = LocalDateTime.now().plusMinutes(AuctionCreationServiceImpl.MIN_LEAD_MINUTES);
        if (request.getScheduledStartTime().isBefore(minStart)) {
            throw new BusinessException("scheduledStartTime must be at least "
                    + AuctionCreationServiceImpl.MIN_LEAD_MINUTES + " minutes in the future");
        }
        if ("TIMED".equals(request.getAuctionMode())) {
            Long d = request.getScheduledDurationSeconds();
            if (d == null) {
                throw new BusinessException("TIMED auctions require scheduledDurationSeconds (21600-43200)");
            }
            if (d < AuctionCreationServiceImpl.MIN_TIMED_DURATION_SECONDS
                    || d > AuctionCreationServiceImpl.MAX_TIMED_DURATION_SECONDS) {
                throw new BusinessException("TIMED auction duration must be between 6 hours (21600s) and 12 hours (43200s)");
            }
        }
    }

    private void validateAuctionSchedule(CreateProductRequestDTO request) {
        if (request.getAuctionMode() == null) {
            return;
        }
        if (request.getScheduledStartTime() == null) {
            throw new BusinessException("scheduledStartTime is required when auctionMode is set");
        }
        LocalDateTime minStart = LocalDateTime.now().plusMinutes(AuctionCreationServiceImpl.MIN_LEAD_MINUTES);
        if (request.getScheduledStartTime().isBefore(minStart)) {
            throw new BusinessException("scheduledStartTime must be at least " + AuctionCreationServiceImpl.MIN_LEAD_MINUTES + " minutes in the future");
        }
        if ("TIMED".equals(request.getAuctionMode())) {
            Long d = request.getScheduledDurationSeconds();
            if (d == null) {
                throw new BusinessException("TIMED auctions require scheduledDurationSeconds (21600-43200)");
            }
            if (d < AuctionCreationServiceImpl.MIN_TIMED_DURATION_SECONDS
                    || d > AuctionCreationServiceImpl.MAX_TIMED_DURATION_SECONDS) {
                throw new BusinessException("TIMED auction duration must be between 6 hours (21600s) and 12 hours (43200s)");
            }
        }
    }

    @Override
    public List<ProductSummaryResponse> getProductsBySellerId(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        if (products.isEmpty()) return List.of();

        List<Long> productIds = products.stream().map(Product::getProductId).toList();
        Map<Long, Auction> auctionsByProductId = getAuctionsByProductId(products);
        Map<Long, String> imageUrlsByProductId = getPrimaryImageUrlsByProductId(products);
        Map<Integer, String> categoryNamesByCategoryId = new HashMap<>();
        for (Product p : products) {
            if (p.getCategoryId() != null && !categoryNamesByCategoryId.containsKey(p.getCategoryId())) {
                categoryRepository.findById(p.getCategoryId())
                        .ifPresent(c -> categoryNamesByCategoryId.put(c.getCategoryId(), c.getCategoryName()));
            }
        }

        return products.stream().map(product -> {
            Auction auction = auctionsByProductId.get(product.getProductId());
            Long currentBid = null;
            if (auction != null) {
                currentBid = auction.getCurrentHighestBid() != null
                        ? auction.getCurrentHighestBid()
                        : product.getStartingPrice();
            }
            String mode = auction != null && auction.getAuctionMode() != null
                    ? auction.getAuctionMode().name()
                    : product.getAuctionMode();
            return ProductSummaryResponse.builder()
                    .productId(product.getProductId())
                    .productName(product.getProductName())
                    .categoryId(product.getCategoryId() == null ? null : product.getCategoryId().longValue())
                    .categoryName(product.getCategoryId() == null ? null : categoryNamesByCategoryId.get(product.getCategoryId()))
                    .startingPrice(product.getStartingPrice())
                    .currentBid(currentBid)
                    .status(product.getStatus())
                    .imageUrl(imageUrlsByProductId.get(product.getProductId()))
                    .auctionId(auction != null ? auction.getAuctionId() : null)
                    .auctionStatus(auction != null ? auction.getStatus() : null)
                    .auctionStartTime(auction != null && auction.getStartTime() != null ? auction.getStartTime().toString() : null)
                    .auctionEndTime(auction != null && auction.getEndTime() != null ? auction.getEndTime().toString() : null)
                    .auctionMode(mode)
                    .scheduledDurationSeconds(product.getScheduledDurationSeconds())
                    .rejectionReason(product.getRejectionReason())
                    .build();
        }).toList();
    }

    private Map<Long, Auction> getAuctionsByProductId(List<Product> products) {
        Map<Long, Auction> result = new HashMap<>();
        for (Product p : products) {
            auctionRepository.findByProduct_ProductId(p.getProductId())
                    .ifPresent(a -> result.put(p.getProductId(), a));
        }
        return result;
    }

    private Map<Long, String> getPrimaryImageUrlsByProductId(List<Product> products) {
        List<Long> productIds = products.stream().map(Product::getProductId).toList();
        Map<Long, String> result = new HashMap<>();
        if (productIds.isEmpty()) return result;
        for (ProductImage image : productImageRepository.findByProductIdIn(productIds)) {
            if (!result.containsKey(image.getProductId())) {
                result.put(image.getProductId(), image.getImageUrl());
            } else if (Boolean.TRUE.equals(image.getIsPrimary())) {
                result.put(image.getProductId(), image.getImageUrl());
            }
        }
        return result;
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Verify ownership
        if (!product.getSellerId().equals(sellerId)) {
            throw new BusinessException("You do not have permission to delete this product");
        }

        // Only allow deletion of non-approved products
        if ("APPROVED".equals(product.getStatus())) {
            throw new BusinessException("Cannot delete an approved product");
        }

        // Delete related records first
        productImageRepository.deleteByProductId(productId);
        productAttributeValueRepository.deleteByProductId(productId);
        productApprovalRepository.deleteByProductId(productId);

        // Delete the product
        productRepository.delete(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO updateProduct(Long productId, UpdateProductRequestDTO request, Long sellerId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        // Verify ownership
        if (!product.getSellerId().equals(sellerId)) {
            throw new BusinessException("You do not have permission to update this product");
        }

        // Only allow update of PENDING or REJECTED products
        if ("APPROVED".equals(product.getStatus())) {
            throw new BusinessException("Cannot update an approved product");
        }

        // Reset status to PENDING if it was REJECTED (so staff can re-review)
        if ("REJECTED".equals(product.getStatus())) {
            product.setStatus("PENDING");
            product.setRejectionReason(null);
        }

        // Update fields only if provided
        if (request.getProductName() != null && !request.getProductName().isBlank()) {
            product.setProductName(request.getProductName().trim());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getStartingPrice() != null && request.getStartingPrice() > 0) {
            product.setStartingPrice(normalizeStartingPrice(request.getStartingPrice()));
            product.setStepPrice(StepCalculator.calculate(product.getStartingPrice()));
        }

        product = productRepository.save(product);
        return convertToDTO(product);
    }

    private void saveApprovalHistory(Product product, Long reviewerId, String status, String reason) {
        ProductApproval approval = new ProductApproval();
        approval.setProductId(product.getProductId());
        approval.setReviewedBy(reviewerId);
        approval.setStatus(status);
        approval.setReason(reason);
        approval.setReviewedAt(LocalDateTime.now());
        productApprovalRepository.save(approval);
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

    private void validateCategoryAttributes(Integer categoryId, List<CreateProductAttributeValueDTO> requestAttributes) {
        if (categoryId == null) return;
        List<CategoryAttribute> requiredAttributes = categoryAttributeRepository.findByCategoryId(categoryId)
                .stream()
                .filter(CategoryAttribute::getIsRequired)
                .toList();

        List<Long> providedIds = requestAttributes == null ? List.of()
                : requestAttributes.stream().map(CreateProductAttributeValueDTO::getAttributeId).toList();

        for (CategoryAttribute required : requiredAttributes) {
            if (!providedIds.contains(required.getAttributeId())) {
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

        Long auctionId = null;
        String auctionStatus = null;
        LocalDateTime auctionStartTime = null;
        LocalDateTime auctionEndTime = null;
        Auction auction = auctionRepository.findByProduct_ProductId(product.getProductId()).orElse(null);
        if (auction != null) {
            auctionId = auction.getAuctionId();
            auctionStatus = auction.getStatus();
            auctionStartTime = auction.getStartTime();
            auctionEndTime = auction.getEndTime();
        }

        Category category = product.getCategoryId() != null
                ? categoryRepository.findById(product.getCategoryId()).orElse(null)
                : null;

        return new ProductResponseDTO(
                product.getProductId(),
                product.getSellerId(),
                product.getCategoryId(),
                category != null ? category.getCategoryName() : null,
                product.getProductName(),
                product.getDescription(),
                product.getStartingPrice(),
                StepCalculator.calculate(product.getStartingPrice()),
                product.getTaxPercent(),
                product.getStatus(),
                product.getSubmittedAt(),
                product.getCreatedAt(),
                product.getRejectionReason(),
                product.getAuctionMode(),
                product.getScheduledStartTime(),
                product.getScheduledDurationSeconds(),
                auctionId,
                auctionStatus,
                auctionStartTime,
                auctionEndTime,
                imgDTOs,
                attrDTOs
        );
    }

    private static long normalizeStartingPrice(Long raw) {
        if (raw == null || raw <= 0) {
            throw new BusinessException("startingPrice must be greater than 0");
        }
        return raw;
    }
}
