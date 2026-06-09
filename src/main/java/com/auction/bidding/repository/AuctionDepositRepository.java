package com.hoangxuananhtuan.auction.repository;

import com.hoangxuananhtuan.auction.domain.AuctionDeposit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuctionDepositRepository extends JpaRepository<AuctionDeposit, Long> {
    Optional<AuctionDeposit> findByAuction_AuctionIdAndUser_UserId(Long auctionId, Long userId);
}

