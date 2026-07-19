package com.auction.fraud.service;

import com.auction.account.dao.AuditLogRepository;
import com.auction.account.entity.AuditLog;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class FraudAuditService {
    private final AuditLogRepository auditLogRepository;

    public void record(String action, Long actorId, Long subjectUserId, String detail) {
        String subject = subjectUserId == null ? "SYSTEM" : "USER:" + subjectUserId;
        if (actorId != null) subject += " ACTOR:" + actorId;
        auditLogRepository.save(new AuditLog(
                truncate(action, 30), true, truncate(subject, 255), truncate(detail, 500),
                null, "fraud-control", LocalDateTime.now()));
    }

    private static String truncate(String value, int max) {
        if (value == null || value.length() <= max) return value;
        return value.substring(0, max);
    }
}
