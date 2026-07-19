package com.auction.fraud.repository;

import com.auction.fraud.entity.FraudAlert;
import com.auction.fraud.entity.FraudAlertStatus;
import com.auction.fraud.entity.FraudRiskLevel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface FraudAlertRepository extends JpaRepository<FraudAlert, Long> {
    Optional<FraudAlert> findFirstByAuctionIdAndSuspectedUserIdAndStatusInOrderByLastDetectedAtDesc(
            Long auctionId, Long suspectedUserId, Collection<FraudAlertStatus> statuses);

    List<FraudAlert> findAllByOrderByLastDetectedAtDesc();
    List<FraudAlert> findByStatusOrderByLastDetectedAtDesc(FraudAlertStatus status);
    List<FraudAlert> findByRiskLevelOrderByLastDetectedAtDesc(FraudRiskLevel riskLevel);
}
