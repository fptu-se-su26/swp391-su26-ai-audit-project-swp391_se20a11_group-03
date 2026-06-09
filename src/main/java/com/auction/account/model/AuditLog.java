package com.vnec.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "AuditLogs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AuditLogID")
    private long id;

    @Column(name = "Action", nullable = false, length = 30)
    private String action;

    @Column(name = "Success", nullable = false)
    private boolean success;

    @Column(name = "Subject", length = 255)
    private String subject;

    @Column(name = "Detail", length = 500)
    private String detail;

    @Column(name = "IpAddress", length = 64)
    private String ipAddress;

    @Column(name = "UserAgent", length = 500)
    private String userAgent;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    public AuditLog() {
    }

    public AuditLog(String action, boolean success, String subject, String detail, String ipAddress, String userAgent, LocalDateTime createdAt) {
        this.action = action;
        this.success = success;
        this.subject = subject;
        this.detail = detail;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.createdAt = createdAt;
    }

    public long getId() {
        return id;
    }

    public String getAction() {
        return action;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getSubject() {
        return subject;
    }

    public String getDetail() {
        return detail;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}