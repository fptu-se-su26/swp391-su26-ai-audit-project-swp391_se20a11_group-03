package com.hoangxuananhtuan.auction.repository;

import com.hoangxuananhtuan.auction.domain.WalletTopUpRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WalletTopUpRequestRepository extends JpaRepository<WalletTopUpRequest, Long> {
    List<WalletTopUpRequest> findByWallet_User_UserIdOrderByCreatedAtDesc(Long userId);
    List<WalletTopUpRequest> findByStatusOrderByCreatedAtDesc(String status);
}
