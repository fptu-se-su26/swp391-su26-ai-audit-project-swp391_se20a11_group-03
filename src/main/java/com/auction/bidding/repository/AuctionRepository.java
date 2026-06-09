package com.hoangxuananhtuan.auction.repository;

import com.hoangxuananhtuan.auction.domain.Auction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    Optional<Auction> findByProduct_ProductId(Long productId);
}

