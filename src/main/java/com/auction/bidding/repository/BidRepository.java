package com.auction.bidding.repository;

import com.auction.bidding.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuctionIdOrderByBidAmountDesc(Long auctionId);
}

