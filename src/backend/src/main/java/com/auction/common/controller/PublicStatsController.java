package com.auction.common.controller;

import com.auction.account.dao.UserRepository;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicStatsController {

    private static final Set<String> COMPLETED_STATUSES = Set.of("ENDED", "PAID", "FORFEITED");

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        var auctions = auctionRepository.findAll();
        long activeAuctions = auctions.stream()
                .map(Auction::getStatus)
                .filter(status -> "ACTIVE".equalsIgnoreCase(status))
                .count();
        long completedAuctions = auctions.stream()
                .map(Auction::getStatus)
                .filter(status -> status != null && COMPLETED_STATUSES.contains(status.toUpperCase()))
                .count();

        return Map.of(
                "totalProducts", productRepository.count(),
                "totalUsers", userRepository.count(),
                "activeAuctions", activeAuctions,
                "completedAuctions", completedAuctions
        );
    }
}
