package com.auction.bidding.repository;

import com.auction.bidding.entity.Auction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    Optional<Auction> findByProduct_ProductId(Long productId);
}

