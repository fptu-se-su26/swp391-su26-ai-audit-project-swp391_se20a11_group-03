package com.auction.fraud.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "SystemSettings")
@Getter
@Setter
public class SystemSetting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SettingId")
    private Long id;

    @Column(name = "SettingKey", nullable = false, unique = true, length = 100)
    private String settingKey;

    @Column(name = "SettingValue", nullable = false, length = 255)
    private String settingValue;

    @Column(name = "UpdatedBy")
    private Long updatedBy;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;
}
