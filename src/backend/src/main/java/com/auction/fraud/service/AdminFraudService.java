package com.auction.fraud.service;

import com.auction.fraud.dto.FraudAlertResponse;
import com.auction.fraud.entity.FraudAction;
import com.auction.fraud.entity.FraudAlert;
import com.auction.fraud.entity.FraudAlertStatus;
import com.auction.fraud.entity.FraudRiskLevel;
import com.auction.fraud.repository.FraudAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminFraudService {
    private final FraudAlertRepository alertRepository;
    private final FraudAlertService alertService;
    private final UserRestrictionService restrictionService;
    private final FraudAuditService auditService;

    public List<FraudAlertResponse> list(String status, String riskLevel, String fraudType,
                                         Long auctionId, Long userId) {
        return alertRepository.findAllByOrderByLastDetectedAtDesc().stream()
                .filter(alert -> status == null || status.isBlank()
                        || alert.getStatus().name().equalsIgnoreCase(status))
                .filter(alert -> riskLevel == null || riskLevel.isBlank()
                        || alert.getRiskLevel().name().equalsIgnoreCase(riskLevel))
                .filter(alert -> fraudType == null || fraudType.isBlank()
                        || alert.getFraudType().toUpperCase().contains(fraudType.toUpperCase()))
                .filter(alert -> auctionId == null || auctionId.equals(alert.getAuctionId()))
                .filter(alert -> userId == null || userId.equals(alert.getSuspectedUserId()))
                .map(FraudAlertResponse::from)
                .toList();
    }

    public FraudAlertResponse get(Long id) {
        return FraudAlertResponse.from(alertService.get(id));
    }

    @Transactional
    public FraudAlertResponse review(Long id, Long adminId, String note) {
        FraudAlert alert = alertService.get(id);
        requireOpen(alert);
        alert.setStatus(FraudAlertStatus.REVIEWING);
        applyReview(alert, adminId, note);
        auditService.record("FRAUD_REVIEW", adminId, alert.getSuspectedUserId(), "Reviewing alert " + id);
        return FraudAlertResponse.from(alertRepository.save(alert));
    }

    @Transactional
    public FraudAlertResponse confirm(Long id, Long adminId, String note) {
        FraudAlert alert = alertService.get(id);
        requireOpen(alert);
        restrictionService.ban(alert.getSuspectedUserId(), adminId, id);
        alert.setStatus(FraudAlertStatus.CONFIRMED);
        alert.setAutomaticAction(FraudAction.PERMANENT_BAN);
        applyReview(alert, adminId, note);
        return FraudAlertResponse.from(alertRepository.save(alert));
    }

    @Transactional
    public FraudAlertResponse dismiss(Long id, Long adminId, String note) {
        FraudAlert alert = alertService.get(id);
        requireOpen(alert);
        alert.setStatus(FraudAlertStatus.DISMISSED);
        applyReview(alert, adminId, note);
        auditService.record("FRAUD_DISMISS", adminId, alert.getSuspectedUserId(), "Dismissed alert " + id);
        return FraudAlertResponse.from(alertRepository.save(alert));
    }

    @Transactional
    public FraudAlertResponse restore(Long id, Long adminId, String note) {
        FraudAlert alert = alertService.get(id);
        restrictionService.restore(alert.getSuspectedUserId(), adminId, id);
        if (alert.getStatus() != FraudAlertStatus.CONFIRMED) alert.setStatus(FraudAlertStatus.DISMISSED);
        applyReview(alert, adminId, note);
        return FraudAlertResponse.from(alertRepository.save(alert));
    }

    private static void applyReview(FraudAlert alert, Long adminId, String note) {
        alert.setReviewedBy(adminId);
        alert.setReviewedAt(LocalDateTime.now());
        alert.setAdminNote(note == null || note.isBlank() ? null : note.trim());
    }

    private static void requireOpen(FraudAlert alert) {
        if (alert.getStatus() == FraudAlertStatus.CONFIRMED || alert.getStatus() == FraudAlertStatus.DISMISSED) {
            throw new IllegalStateException("Fraud alert has already been resolved");
        }
    }
}
