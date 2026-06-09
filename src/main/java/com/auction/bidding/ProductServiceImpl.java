package com.hoangxuananhtuan.auction.service.impl;

import com.hoangxuananhtuan.auction.domain.Auction;
import com.hoangxuananhtuan.auction.domain.Bid;
import com.hoangxuananhtuan.auction.domain.Product;
import com.hoangxuananhtuan.auction.dto.*;
import com.hoangxuananhtuan.auction.exception.ResourceNotFoundException;
import com.hoangxuananhtuan.auction.repository.AuctionRepository;
import com.hoangxuananhtuan.auction.repository.BidRepository;
import com.hoangxuananhtuan.auction.repository.ProductRepository;
import com.hoangxuananhtuan.auction.service.ProductService;
import com.hoangxuananhtuan.auction.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;

    @Override
    public PageResponse<ProductSummaryResponse> searchProducts(ProductSearchRequest request) {
        Specification<Product> spec = Specification
                .where(ProductSpecification.isActive())
                .and(ProductSpecification.hasProductName(request.getProductName()))
                .and(ProductSpecification.hasCategoryId(request.getCategoryId()))
                .and(ProductSpecification.hasMinStartingPrice(request.getMinStartingPrice()))
                .and(ProductSpecification.hasMaxStartingPrice(request.getMaxStartingPrice()));

        Page<Product> pageData = productRepository.findAll(
                spec,
                PageRequest.of(
                        request.getPage() == null ? 0 : request.getPage(),
                        request.getSize() == null ? 10 : request.getSize(),
                        Sort.by(Sort.Direction.DESC, "productId")
                )
        );

        List<ProductSummaryResponse> content = pageData.getContent().stream()
                .map(this::toSummaryResponse)
                .toList();

        return PageResponse.<ProductSummaryResponse>builder()
                .content(content)
                .page(pageData.getNumber())
                .size(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .build();
    }

    @Override
    public ProductDetailResponse getProductDetail(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        Auction auction = auctionRepository.findByProduct_ProductId(productId).orElse(null);
        AuctionResponse auctionResponse = null;

        if (auction != null) {
            List<BidResponse> bids = bidRepository.findByAuction_AuctionIdOrderByBidAmountDesc(auction.getAuctionId())
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
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .startingPrice(product.getStartingPrice())
                .status(product.getStatus())
                .auction(auctionResponse)
                .build();
    }

    private ProductSummaryResponse toSummaryResponse(Product product) {
        return ProductSummaryResponse.builder()
                .productId(product.getProductId())
                .productName(product.getProductName())
                .categoryId(product.getCategory() != null ? product.getCategory().getCategoryId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getCategoryName() : null)
                .startingPrice(product.getStartingPrice())
                .status(product.getStatus())
                .build();
    }

    private BidResponse toBidResponse(Bid bid) {
        return BidResponse.builder()
                .bidId(bid.getBidId())
                .userId(bid.getUser() != null ? bid.getUser().getUserId() : null)
                .bidderName(bid.getUser() != null ? bid.getUser().getUsername() : null)
                .bidAmount(bid.getBidAmount())
                .bidTime(bid.getBidTime())
                .build();
    }
}
