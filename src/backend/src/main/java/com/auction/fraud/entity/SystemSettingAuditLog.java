package com.auction.fraud.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "SystemSettingAuditLogs")
@Getter
@Setter
public class SystemSettingAuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SettingAuditId")
    private Long id;

    @Column(name = "SettingKey", nullable = false, length = 100)
    private String settingKey;

    @Column(name = "OldValue", length = 255)
    private String oldValue;

    @Column(name = "NewValue", nullable = false, length = 255)
    private String newValue;

    @Column(name = "ChangedBy", nullable = false)
    private Long changedBy;

    @Column(name = "Reason", length = 500)
    private String reason;

    @Column(name = "ChangedAt", nullable = false)
    private LocalDateTime changedAt;
}
