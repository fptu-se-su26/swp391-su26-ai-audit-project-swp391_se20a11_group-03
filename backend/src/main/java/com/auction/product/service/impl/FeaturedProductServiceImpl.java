package com.auction.product.service.impl;

import com.auction.bidding.repository.AuctionRepository;
import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.product.dto.*;
import com.auction.product.entity.FeaturedProduct;
import com.auction.product.entity.Product;
import com.auction.product.repository.BiddingProductRepository;
import com.auction.product.repository.FeaturedProductRepository;
import com.auction.product.service.BiddingProductService;
import com.auction.product.service.FeaturedProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FeaturedProductServiceImpl implements FeaturedProductService {

    private static final List<String> PERIOD_TYPES = List.of("DAILY", "WEEKLY", "MONTHLY");
    private static final int MAX_SLOTS = 4;

    private final FeaturedProductRepository featuredProductRepository;
    private final BiddingProductRepository productRepository;
    private final AuctionRepository auctionRepository;
    private final BiddingProductService biddingProductService;

    @Override
    @Transactional(readOnly = true)
    public FeaturedProductsResponse getPublicFeaturedProducts() {
        return FeaturedProductsResponse.builder()
                .daily(loadSummariesForPeriod("DAILY"))
                .weekly(loadSummariesForPeriod("WEEKLY"))
                .monthly(loadSummariesForPeriod("MONTHLY"))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminFeaturedProductsResponse getAdminFeaturedProducts() {
        return AdminFeaturedProductsResponse.builder()
                .daily(loadSlotsForPeriod("DAILY"))
                .weekly(loadSlotsForPeriod("WEEKLY"))
                .monthly(loadSlotsForPeriod("MONTHLY"))
                .build();
    }

    @Override
    @Transactional
    public void updateFeaturedProducts(UpdateFeaturedProductsRequest request, Long updatedByUserId) {
        if (request == null || request.getPeriodType() == null || request.getPeriodType().isBlank()) {
            throw new BusinessException("periodType is required");
        }
        String periodType = request.getPeriodType().trim().toUpperCase();
        if (!PERIOD_TYPES.contains(periodType)) {
            throw new BusinessException("periodType must be DAILY, WEEKLY, or MONTHLY");
        }

        List<Long> productIds = request.getProductIds() != null ? request.getProductIds() : List.of();
        if (productIds.size() > MAX_SLOTS) {
            throw new BusinessException("At most 4 products per period");
        }

        Set<Long> seen = new HashSet<>();
        List<Long> normalized = new ArrayList<>();
        for (Long productId : productIds) {
            if (productId == null) {
                continue;
            }
            if (productId <= 0) {
                throw new BusinessException("Invalid product id: " + productId);
            }
            if (!seen.add(productId)) {
                throw new BusinessException("Duplicate product in selection");
            }
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + productId));
            if (!"APPROVED".equalsIgnoreCase(product.getStatus())) {
                throw new BusinessException("Product must be APPROVED: " + product.getProductName());
            }
            if (!auctionRepository.findByProduct_ProductId(productId).isPresent()) {
                throw new BusinessException("Product has no auction session: " + product.getProductName());
            }
            normalized.add(productId);
        }

        featuredProductRepository.deleteByPeriodType(periodType);
        LocalDateTime now = LocalDateTime.now();
        for (int i = 0; i < normalized.size(); i++) {
            FeaturedProduct row = new FeaturedProduct();
            row.setPeriodType(periodType);
            row.setProductId(normalized.get(i));
            row.setDisplayOrder(i + 1);
            row.setUpdatedAt(now);
            row.setUpdatedBy(updatedByUserId);
            featuredProductRepository.save(row);
        }
    }

    private List<ProductSummaryResponse> loadSummariesForPeriod(String periodType) {
        List<Long> productIds = featuredProductRepository.findByPeriodTypeOrderByDisplayOrderAsc(periodType)
                .stream()
                .map(FeaturedProduct::getProductId)
                .toList();
        return biddingProductService.getProductSummariesByIds(productIds);
    }

    private List<FeaturedProductSlotDTO> loadSlotsForPeriod(String periodType) {
        List<FeaturedProduct> rows = featuredProductRepository.findByPeriodTypeOrderByDisplayOrderAsc(periodType);
        if (rows.isEmpty()) {
            return List.of();
        }
        List<Long> productIds = rows.stream().map(FeaturedProduct::getProductId).toList();
        List<ProductSummaryResponse> summaries = biddingProductService.getProductSummariesByIds(productIds);
        List<FeaturedProductSlotDTO> slots = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            FeaturedProduct row = rows.get(i);
            ProductSummaryResponse product = i < summaries.size() ? summaries.get(i) : null;
            slots.add(FeaturedProductSlotDTO.builder()
                    .displayOrder(row.getDisplayOrder())
                    .productId(row.getProductId())
                    .product(product)
                    .build());
        }
        return slots;
    }
}
