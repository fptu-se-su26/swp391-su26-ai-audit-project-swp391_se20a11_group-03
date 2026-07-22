package com.auction.bidding.repository;

import com.auction.bidding.entity.AutoBid;
import com.auction.bidding.entity.AutoBidStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AutoBidRepository extends JpaRepository<AutoBid, Long> {
    Optional<AutoBid> findByAuctionIdAndUserId(Long auctionId, Long userId);
    List<AutoBid> findByAuctionIdAndStatus(Long auctionId, AutoBidStatus status);
}
