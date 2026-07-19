package com.auction.product.controller;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.account.security.UserDetailsImpl;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.product.entity.Product;
import com.auction.product.entity.ProductImage;
import com.auction.product.entity.Watchlist;
import com.auction.product.repository.ProductImageRepository;
import com.auction.product.repository.ProductRepository;
import com.auction.product.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
@Slf4j
public class WatchlistController {

    private final WatchlistRepository watchlistRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final AuctionRepository auctionRepository;
    private final UserRepository userRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<?> getWatchlist(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of()
            ));
        }

        try {
            List<Watchlist> items = watchlistRepository.findByUserId(Math.toIntExact(currentUser.getId()));
            List<Map<String, Object>> data = items.stream().map(item -> {
                Map<String, Object> map = new HashMap<>();
                Product product = item.getProduct();
                Auction auction = auctionRepository.findByProduct_ProductId(product.getProductId()).orElse(null);
                List<ProductImage> images = productImageRepository.findByProductId(product.getProductId());
                String imageUrl = images.stream()
                        .sorted(Comparator.comparing((ProductImage image) -> !Boolean.TRUE.equals(image.getIsPrimary())))
                        .map(ProductImage::getImageUrl)
                        .findFirst()
                        .orElse(null);
                map.put("id", item.getWatchlistId());
                map.put("productId", product.getProductId());
                map.put("auctionId", auction != null ? auction.getAuctionId() : null);
                map.put("productName", product.getProductName());
                map.put("lotNumber", "LOT-" + product.getProductId());
                map.put("image", imageUrl);
                map.put("currentBid", auction != null && auction.getCurrentHighestBid() != null ? auction.getCurrentHighestBid() : product.getStartingPrice());
                map.put("endTime", auction != null ? auction.getEndTime() : null);
                map.put("status", auction != null ? auction.getStatus() : product.getStatus());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", data
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of()
            ));
        }
    }

    @PostMapping("/{productId}")
    @Transactional
    public ResponseEntity<?> addToWatchlist(
            @PathVariable("productId") Long productId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        log.info("POST /api/watchlist/{} called. currentUser: {}", productId, currentUser);
        if (currentUser == null) {
            log.warn("User not authenticated for watchlist add");
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Please login to add to watchlist"
            ));
        }

        try {
            if (!watchlistRepository.existsByUserAndProduct(Math.toIntExact(currentUser.getId()), productId)) {
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
                User user = userRepository.findById(Math.toIntExact(currentUser.getId()))
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUser.getId()));

                Watchlist watchlist = new Watchlist();
                watchlist.setUser(user);
                watchlist.setProduct(product);
                watchlistRepository.save(watchlist);
            }

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Added to watchlist"
            ));
        } catch (Exception e) {
            log.error("Error adding to watchlist: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to add to watchlist"
            ));
        }
    }

    @DeleteMapping("/{productId}")
    @Transactional
    public ResponseEntity<?> removeFromWatchlist(
            @PathVariable("productId") Long productId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Please login to remove from watchlist"
            ));
        }

        try {
            watchlistRepository.removeFromWatchlist(Math.toIntExact(currentUser.getId()), productId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Removed from watchlist"
            ));
        } catch (Exception e) {
            log.error("Error removing from watchlist: ", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to remove from watchlist"
            ));
        }
    }
}
