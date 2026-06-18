package com.auction.bidding.repository;

import com.auction.bidding.entity.AuctionDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuctionDepositRepository extends JpaRepository<AuctionDeposit, Long> {
    Optional<AuctionDeposit> findByAuction_AuctionIdAndUser_Id(Long auctionId, Integer userId);
    List<AuctionDeposit> findByAuction_AuctionId(Long auctionId);
    List<AuctionDeposit> findByUser_Id(Integer userId);
}

