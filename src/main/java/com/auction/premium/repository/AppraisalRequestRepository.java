package com.auction.premium.repository;

import com.auction.premium.entity.AppraisalRequest;
import com.auction.premium.entity.AppraisalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppraisalRequestRepository extends JpaRepository<AppraisalRequest, Long> {
    boolean existsBySellerIdAndProductIdAndStatus(Long sellerId, Long productId, AppraisalStatus status);
}
