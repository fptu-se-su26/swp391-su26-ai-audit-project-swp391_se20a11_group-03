package com.auction.product.service.impl;

import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.Bid;
import com.auction.bidding.util.StepCalculator;
import com.auction.product.entity.Product;
import com.auction.product.entity.ProductImage;
import com.auction.product.dto.*;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.BidRepository;
import com.auction.product.repository.BiddingProductRepository;
import com.auction.product.repository.ProductImageRepository;
import com.auction.common.dto.PageResponse;
import com.auction.product.service.BiddingProductService;
import com.auction.product.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BiddingProductServiceImpl implements BiddingProductService {

    private final BiddingProductRepository productRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final ProductImageRepository productImageRepository;

    @Override
    public PageResponse<ProductSummaryResponse> searchProducts(ProductSearchRequest request) {
        Specification<Product> spec = Specification
                .where(ProductSpecification.hasStatus(request.getStatus()))
                .and(ProductSpecification.hasProductName(request.getProductName()))
                .and(ProductSpecification.hasCategoryId(request.getCategoryId()))
                .and(ProductSpecification.hasMinStartingPrice(request.getMinStartingPrice()))
                .and(ProductSpecification.hasMaxStartingPrice(request.getMaxStartingPrice()));

        List<Product> products = productRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "productId"));
        Map<Long, Auction> auctionsByProductId = getAuctionsByProductId(products);
        Map<Long, String> imageUrlsByProductId = getPrimaryImageUrlsByProductId(products);
        Map<Long, Long> bidCountsByAuctionId = getBidCountsByAuctionId(auctionsByProductId);

        List<ProductSummaryResponse> filtered = products.stream()
                .map(product -> toSummaryResponse(
                        product,
                        auctionsByProductId.get(product.getProductId()),
                        imageUrlsByProductId.get(product.getProductId()),
                        bidCountsByAuctionId))
                .filter(response -> matchesAuctionStatus(response, request.getAuctionStatus()))
                .filter(response -> matchesAuctionMode(response, request.getAuctionMode()))
                .toList();

        int page = request.getPage() == null ? 0 : Math.max(0, request.getPage());
        int size = request.getSize() == null ? 10 : Math.max(1, request.getSize());
        int fromIndex = Math.min(page * size, filtered.size());
        int toIndex = Math.min(fromIndex + size, filtered.size());
        List<ProductSummaryResponse> content = filtered.subList(fromIndex, toIndex);

        return PageResponse.<ProductSummaryResponse>builder()
                .content(content)
                .page(page)
                .size(size)
                .totalElements(filtered.size())
                .totalPages(filtered.isEmpty() ? 0 : (int) Math.ceil((double) filtered.size() / size))
                .build();
    }

    @Override
    public ProductDetailResponse getProductDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Auction auction = auctionRepository.findByProduct_ProductId(productId).orElse(null);
        AuctionResponse auctionResponse = null;
        List<ProductImage> images = productImageRepository.findByProductId(productId);
        List<String> imageUrls = images.stream()
                .sorted(Comparator.comparing((ProductImage image) -> !Boolean.TRUE.equals(image.getIsPrimary())))
                .map(ProductImage::getImageUrl)
                .toList();
        String primaryImageUrl = imageUrls.stream().findFirst().orElse(null);

        if (auction != null) {
            List<BidResponse> bids = bidRepository.findByAuctionIdOrderByBidAmountDesc(auction.getAuctionId())
                    .stream()
                    .map(this::toBidResponse)
                    .toList();

            auctionResponse = AuctionResponse.builder()
                    .auctionId(auction.getAuctionId())
                    .startTime(auction.getStartTime())
                    .endTime(auction.getEndTime())
                    .status(auction.getStatus())
                    .bids(bids)
                    .build();
        }

        return ProductDetailResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .description(product.getDescription())
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId().longValue() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .sellerId(product.getSellerId())
                .startingPrice(product.getStartingPrice())
                .stepPrice(StepCalculator.calculate(product.getStartingPrice()))
                .currentBid(auction != null
                        ? (auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : product.getStartingPrice())
                        : product.getStartingPrice())
                .status(product.getStatus())
                .imageUrl(primaryImageUrl)
                .imageUrls(imageUrls)
                .auctionMode(auction != null && auction.getAuctionMode() != null
                        ? auction.getAuctionMode().name()
                        : product.getAuctionMode())
                .scheduledDurationSeconds(auction != null ? auction.getScheduledDurationSeconds() : null)
                .auctionId(auction != null ? auction.getAuctionId() : null)
                .auctionStatus(resolveEffectiveAuctionStatus(auction))
                .auctionStartTime(auction != null && auction.getStartTime() != null ? auction.getStartTime().toString() : null)
                .auctionEndTime(auction != null && auction.getEndTime() != null ? auction.getEndTime().toString() : null)
                .auctionPaymentStatus(auction != null ? auction.getPaymentStatus() : null)
                .auctionPaymentDeadline(auction != null && auction.getPaymentDeadline() != null ? auction.getPaymentDeadline().toString() : null)
                .auction(auctionResponse)
                .build();
    }

    @Override
    public List<ProductSummaryResponse> getProductSummariesByIds(List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return List.of();
        }
        List<Long> distinctIds = productIds.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .toList();
        if (distinctIds.isEmpty()) {
            return List.of();
        }
        List<Product> products = productRepository.findAllById(distinctIds);
        Map<Long, Auction> auctionsByProductId = getAuctionsByProductId(products);
        Map<Long, String> imageUrlsByProductId = getPrimaryImageUrlsByProductId(products);
        Map<Long, Long> bidCountsByAuctionId = getBidCountsByAuctionId(auctionsByProductId);
        Map<Long, Product> productById = new HashMap<>();
        for (Product product : products) {
            productById.put(product.getProductId(), product);
        }
        return distinctIds.stream()
                .map(productById::get)
                .filter(product -> product != null)
                .map(product -> toSummaryResponse(
                        product,
                        auctionsByProductId.get(product.getProductId()),
                        imageUrlsByProductId.get(product.getProductId()),
                        bidCountsByAuctionId))
                .toList();
    }

    private ProductSummaryResponse toSummaryResponse(
            Product product,
            Auction auction,
            String imageUrl,
            Map<Long, Long> bidCountsByAuctionId) {
        Long currentBid = auction != null
                ? (auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : product.getStartingPrice())
                : null;
        return ProductSummaryResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId().longValue() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .startingPrice(product.getStartingPrice())
                .currentBid(currentBid)
                .status(product.getStatus())
                .imageUrl(imageUrl)
                .auctionId(auction != null ? auction.getAuctionId() : null)
                .totalBids(auction != null
                        ? bidCountsByAuctionId.getOrDefault(auction.getAuctionId(), 0L)
                        : 0L)
                .auctionStatus(resolveEffectiveAuctionStatus(auction))
                .auctionStartTime(auction != null && auction.getStartTime() != null ? auction.getStartTime().toString() : null)
                .auctionEndTime(auction != null && auction.getEndTime() != null ? auction.getEndTime().toString() : null)
                .auctionMode(auction != null && auction.getAuctionMode() != null
                        ? auction.getAuctionMode().name()
                        : product.getAuctionMode())
                .scheduledDurationSeconds(auction != null ? auction.getScheduledDurationSeconds() : null)
                .build();
    }

    private Map<Long, Long> getBidCountsByAuctionId(Map<Long, Auction> auctionsByProductId) {
        List<Long> auctionIds = auctionsByProductId.values().stream()
                .map(Auction::getAuctionId)
                .filter(id -> id != null)
                .distinct()
                .toList();
        Map<Long, Long> result = new HashMap<>();
        if (auctionIds.isEmpty()) {
            return result;
        }
        for (Object[] row : bidRepository.countByAuctionIds(auctionIds)) {
            result.put(((Number) row[0]).longValue(), ((Number) row[1]).longValue());
        }
        return result;
    }

    private boolean matchesAuctionStatus(ProductSummaryResponse response, String auctionStatus) {
        if (auctionStatus == null || auctionStatus.isBlank()) {
            return true;
        }
        // If auctionStatus is specified, product MUST have an auction with that status
        if (response.getAuctionStatus() == null) {
            return false;
        }
        return auctionStatus.equalsIgnoreCase(response.getAuctionStatus());
    }

    private boolean matchesAuctionMode(ProductSummaryResponse response, String auctionMode) {
        if (auctionMode == null || auctionMode.isBlank()) {
            return true;
        }
        return response.getAuctionMode() != null
                && auctionMode.equalsIgnoreCase(response.getAuctionMode());
    }

    /**
     * Derive the public lifecycle from the schedule instead of waiting for the
     * periodic database synchronizer. Terminal statuses must remain unchanged.
     */
    private String resolveEffectiveAuctionStatus(Auction auction) {
        if (auction == null) {
            return null;
        }
        String persistedStatus = auction.getStatus();
        if (!"UPCOMING".equalsIgnoreCase(persistedStatus)
                && !"ACTIVE".equalsIgnoreCase(persistedStatus)) {
            return persistedStatus;
        }

        LocalDateTime now = LocalDateTime.now();
        if (auction.getEndTime() != null && !now.isBefore(auction.getEndTime())) {
            return "ENDED";
        }
        if (auction.getStartTime() != null && now.isBefore(auction.getStartTime())) {
            return "UPCOMING";
        }
        return "ACTIVE";
    }

    private Map<Long, Auction> getAuctionsByProductId(List<Product> products) {
        List<Long> productIds = products.stream()
                .map(Product::getProductId)
                .toList();
        Map<Long, Auction> auctionsByProductId = new HashMap<>();
        if (productIds.isEmpty()) {
            return auctionsByProductId;
        }
        for (Auction auction : auctionRepository.findByProduct_ProductIdIn(productIds)) {
            if (auction.getProduct() != null) {
                auctionsByProductId.put(auction.getProduct().getProductId(), auction);
            }
        }
        return auctionsByProductId;
    }

    private Map<Long, String> getPrimaryImageUrlsByProductId(List<Product> products) {
        List<Long> productIds = products.stream()
                .map(Product::getProductId)
                .toList();
        Map<Long, String> imageUrlsByProductId = new HashMap<>();
        if (productIds.isEmpty()) {
            return imageUrlsByProductId;
        }
        for (ProductImage image : productImageRepository.findByProductIdIn(productIds)) {
            if (!imageUrlsByProductId.containsKey(image.getProductId())) {
                imageUrlsByProductId.put(image.getProductId(), image.getImageUrl());
            } else if (Boolean.TRUE.equals(image.getIsPrimary())) {
                imageUrlsByProductId.put(image.getProductId(), image.getImageUrl());
            }
        }
        return imageUrlsByProductId;
    }

    private BidResponse toBidResponse(Bid bid) {
        return BidResponse.builder()
                .bidId(bid.getBidId())
                .userId(bid.getUser() != null ? bid.getUser().getUserId() : null)
                .bidderName(bid.getUser() != null ? bid.getUser().getUsername() : null)
                .bidAmount(bid.getBidAmount() != null ? BigDecimal.valueOf(bid.getBidAmount()) : null)
                .bidTime(bid.getBidTime())
                .build();
    }
}

