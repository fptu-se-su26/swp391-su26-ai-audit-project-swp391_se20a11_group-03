package com.auction.premium.repository;

import com.auction.premium.entity.AutoBidConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AutoBidConfigRepository extends JpaRepository<AutoBidConfig, Long> {
    Optional<AutoBidConfig> findByBuyerIdAndAuctionId(Long buyerId, Long auctionId);
    List<AutoBidConfig> findByAuctionIdAndActiveTrueOrderByMaxPriceDesc(Long auctionId);
}
