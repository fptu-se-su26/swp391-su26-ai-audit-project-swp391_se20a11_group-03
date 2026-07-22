package com.auction.product.controller;

import com.auction.common.dto.PageResponse;
import com.auction.product.dto.ProductDetailResponse;
import com.auction.product.dto.ProductSearchRequest;
import com.auction.product.dto.ProductSummaryResponse;
import com.auction.product.service.BiddingProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class BiddingProductController {

    private final BiddingProductService productService;

    @GetMapping
    public ResponseEntity<PageResponse<ProductSummaryResponse>> searchProducts(
            @RequestParam(name = "productName", required = false) String productName,
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "categoryId", required = false) Integer categoryId,
            @RequestParam(name = "minStartingPrice", required = false) Long minStartingPrice,
            @RequestParam(name = "minPrice", required = false) Long minPrice,
            @RequestParam(name = "maxStartingPrice", required = false) Long maxStartingPrice,
            @RequestParam(name = "maxPrice", required = false) Long maxPrice,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "auctionStatus", required = false) String auctionStatus,
            @RequestParam(name = "auctionMode", required = false) String auctionMode,
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "10") Integer size
    ) {
        ProductSearchRequest request = new ProductSearchRequest();
        request.setProductName(productName != null && !productName.isBlank() ? productName : keyword);
        request.setCategoryId(categoryId);
        request.setMinStartingPrice(minStartingPrice != null ? minStartingPrice : minPrice);
        request.setMaxStartingPrice(maxStartingPrice != null ? maxStartingPrice : maxPrice);
        request.setStatus(status);
        request.setAuctionStatus(auctionStatus);
        request.setAuctionMode(auctionMode);
        request.setPage(page);
        request.setSize(size);

        return ResponseEntity.ok(productService.searchProducts(request));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDetailResponse> getProductDetail(@PathVariable("productId") Long productId) {
        return ResponseEntity.ok(productService.getProductDetail(productId));
    }
}

