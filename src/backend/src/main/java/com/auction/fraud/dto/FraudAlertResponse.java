package com.auction.fraud.dto;

import com.auction.fraud.entity.FraudAction;
import com.auction.fraud.entity.FraudAlert;
import com.auction.fraud.entity.FraudAlertStatus;
import com.auction.fraud.entity.FraudRiskLevel;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

public record FraudAlertResponse(
        Long id,
        Long auctionId,
        Long suspectedUserId,
        Long triggerBidId,
        String fraudType,
        List<String> signals,
        int riskScore,
        FraudRiskLevel riskLevel,
        String description,
        FraudAlertStatus status,
        FraudAction automaticAction,
        int occurrenceCount,
        LocalDateTime firstDetectedAt,
        LocalDateTime lastDetectedAt,
        Long reviewedBy,
        LocalDateTime reviewedAt,
        String adminNote
) {
    public static FraudAlertResponse from(FraudAlert alert) {
        List<String> signalList = alert.getSignals() == null || alert.getSignals().isBlank()
                ? List.of()
                : Arrays.stream(alert.getSignals().split(","))
                    .map(String::trim)
                    .filter(value -> !value.isBlank())
                    .toList();
        return new FraudAlertResponse(
                alert.getId(), alert.getAuctionId(), alert.getSuspectedUserId(), alert.getTriggerBidId(),
                alert.getFraudType(), signalList, alert.getRiskScore(), alert.getRiskLevel(),
                alert.getDescription(), alert.getStatus(), alert.getAutomaticAction(),
                alert.getOccurrenceCount(), alert.getFirstDetectedAt(), alert.getLastDetectedAt(),
                alert.getReviewedBy(), alert.getReviewedAt(), alert.getAdminNote());
    }
}
