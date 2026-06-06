package com.hoangxuananhtuan.auction.repository;

import com.hoangxuananhtuan.auction.domain.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuction_AuctionIdOrderByBidAmountDesc(Long auctionId);
}
