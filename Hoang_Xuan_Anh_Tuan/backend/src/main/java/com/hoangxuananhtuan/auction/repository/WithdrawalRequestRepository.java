package com.hoangxuananhtuan.auction.repository;

import com.hoangxuananhtuan.auction.domain.WithdrawalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {
    List<WithdrawalRequest> findByWallet_User_UserIdOrderByCreatedAtDesc(Long userId);
    List<WithdrawalRequest> findByStatusOrderByCreatedAtDesc(String status);
}
