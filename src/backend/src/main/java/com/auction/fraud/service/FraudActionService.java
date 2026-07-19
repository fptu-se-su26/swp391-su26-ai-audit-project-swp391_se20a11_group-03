package com.auction.fraud.service;

import com.auction.bidding.entity.Bid;
import com.auction.fraud.dto.FraudAlertResponse;
import com.auction.fraud.entity.FraudAction;
import com.auction.fraud.entity.FraudAlert;
import com.auction.fraud.entity.FraudRiskLevel;
import com.auction.fraud.model.FraudSignal;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FraudActionService {
    public static final String ADMIN_FRAUD_TOPIC = "/topic/admin/fraud-alerts";

    private final FraudConfigService configService;
    private final FraudAlertService alertService;
    private final UserRestrictionService restrictionService;
    private final FraudAuditService auditService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void process(Bid bid, List<FraudSignal> signals, int riskScore) {
        FraudRiskLevel level = FraudRiskLevel.fromScore(riskScore);
        if (level == FraudRiskLevel.LOW) {
            auditService.record("FRAUD_SIGNAL", null, bid.getUserId(),
                    "LOW score=" + riskScore + ", auction=" + bid.getAuctionId());
            return;
        }

        FraudAction action = resolveAction(level);
        FraudAlert alert = alertService.createOrUpdate(bid, signals, riskScore, level, action);

        if (configService.isAutoRestrictionEnabled()) {
            if (level == FraudRiskLevel.HIGH) {
                restrictionService.restrictBidding(bid.getUserId(), Duration.ofMinutes(30), alert.getId());
            } else if (level == FraudRiskLevel.CRITICAL) {
                restrictionService.suspendAccount(bid.getUserId(), alert.getId());
            }
        }

        auditService.record("FRAUD_ALERT", null, bid.getUserId(),
                "Alert " + alert.getId() + ", score=" + riskScore + ", level=" + level);
        if (configService.isAlertEnabled()) {
            messagingTemplate.convertAndSend(ADMIN_FRAUD_TOPIC, Map.of(
                    "type", "FRAUD_ALERT_CREATED",
                    "alert", FraudAlertResponse.from(alert)));
        }
    }

    private FraudAction resolveAction(FraudRiskLevel level) {
        if (!configService.isAutoRestrictionEnabled()) return FraudAction.WARN_ADMIN;
        return switch (level) {
            case HIGH -> FraudAction.TEMPORARY_BID_RESTRICTION;
            case CRITICAL -> FraudAction.TEMPORARY_ACCOUNT_SUSPENSION;
            case MEDIUM -> FraudAction.WARN_ADMIN;
            case LOW -> FraudAction.LOG_ONLY;
        };
    }
}
