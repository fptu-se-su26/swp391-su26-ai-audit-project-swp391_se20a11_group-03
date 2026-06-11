package com.vnec.util;

import com.vnec.dao.AuditLogDAO;
import com.vnec.model.AuditLog;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public final class AuditLogUtil {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final AuditLogDAO AUDIT_LOG_DAO = new AuditLogDAO();

    private AuditLogUtil() {
    }

    public static void authEvent(String action, boolean success, String subject, String detail, String ip, String userAgent) {
        AuditLog auditLog = new AuditLog(
                safe(action),
                success,
                safe(subject),
                safe(detail),
                safe(ip),
                safe(userAgent),
                LocalDateTime.now()
        );
        try {
            AUDIT_LOG_DAO.save(auditLog);
        } catch (RuntimeException ex) {
            String message = String.format(
                    "[%s] action=%s success=%s subject=%s detail=%s ip=%s ua=%s",
                    LocalDateTime.now().format(FORMATTER),
                    safe(action),
                    success,
                    safe(subject),
                    safe(detail),
                    safe(ip),
                    safe(userAgent)
            );
            System.out.println(message);
        }
    }

    private static String safe(String value) {
        return value == null ? "-" : value.replaceAll("[\r\n]+", " ").trim();
    }
}