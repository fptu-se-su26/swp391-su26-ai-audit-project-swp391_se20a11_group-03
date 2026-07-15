package com.auction.wallet.repository;

import com.auction.wallet.entity.WithdrawalRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WithdrawalRequestRepository extends JpaRepository<WithdrawalRequest, Long> {
    List<WithdrawalRequest> findAllByOrderByCreatedAtDesc();

    List<WithdrawalRequest> findByStatusOrderByCreatedAtDesc(String status);

    List<WithdrawalRequest> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
