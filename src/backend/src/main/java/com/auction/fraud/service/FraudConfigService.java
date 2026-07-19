package com.auction.fraud.service;

import com.auction.fraud.dto.FraudSettingsResponse;
import com.auction.fraud.dto.UpdateFraudSettingsRequest;
import com.auction.fraud.entity.SystemSetting;
import com.auction.fraud.entity.SystemSettingAuditLog;
import com.auction.fraud.entity.SystemSettingKey;
import com.auction.fraud.repository.SystemSettingAuditLogRepository;
import com.auction.fraud.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class FraudConfigService {
    private final SystemSettingRepository settingRepository;
    private final SystemSettingAuditLogRepository auditRepository;
    private final FraudAuditService fraudAuditService;

    public boolean isDetectionEnabled() {
        return getBoolean(SystemSettingKey.FRAUD_DETECTION_ENABLED, true);
    }

    public boolean isAutoRestrictionEnabled() {
        return getBoolean(SystemSettingKey.AUTO_RESTRICTION_ENABLED, false);
    }

    public boolean isAlertEnabled() {
        return getBoolean(SystemSettingKey.FRAUD_ALERT_ENABLED, true);
    }

    public FraudSettingsResponse getSettings() {
        LocalDateTime updatedAt = settingRepository.findAll().stream()
                .map(SystemSetting::getUpdatedAt)
                .filter(value -> value != null)
                .max(Comparator.naturalOrder())
                .orElse(null);
        return new FraudSettingsResponse(
                isDetectionEnabled(), isAutoRestrictionEnabled(), isAlertEnabled(), updatedAt);
    }

    @Transactional
    public FraudSettingsResponse updateSettings(UpdateFraudSettingsRequest request, Long adminId) {
        LocalDateTime now = LocalDateTime.now();
        update(SystemSettingKey.FRAUD_DETECTION_ENABLED, request.detectionEnabled(), adminId, request.reason(), now);
        update(SystemSettingKey.AUTO_RESTRICTION_ENABLED, request.autoRestrictionEnabled(), adminId, request.reason(), now);
        update(SystemSettingKey.FRAUD_ALERT_ENABLED, request.alertEnabled(), adminId, request.reason(), now);
        fraudAuditService.record("FRAUD_SETTINGS", adminId, null,
                "Updated fraud settings. Reason: " + request.reason());
        return new FraudSettingsResponse(request.detectionEnabled(), request.autoRestrictionEnabled(), request.alertEnabled(), now);
    }

    private boolean getBoolean(SystemSettingKey key, boolean defaultValue) {
        return settingRepository.findBySettingKey(key.name())
                .map(SystemSetting::getSettingValue)
                .map(Boolean::parseBoolean)
                .orElse(defaultValue);
    }

    private void update(SystemSettingKey key, boolean value, Long adminId, String reason, LocalDateTime now) {
        SystemSetting setting = settingRepository.findBySettingKey(key.name()).orElseGet(SystemSetting::new);
        String oldValue = setting.getSettingValue();
        String newValue = Boolean.toString(value);
        setting.setSettingKey(key.name());
        setting.setSettingValue(newValue);
        setting.setUpdatedBy(adminId);
        setting.setUpdatedAt(now);
        settingRepository.save(setting);

        if (!newValue.equals(oldValue)) {
            SystemSettingAuditLog audit = new SystemSettingAuditLog();
            audit.setSettingKey(key.name());
            audit.setOldValue(oldValue);
            audit.setNewValue(newValue);
            audit.setChangedBy(adminId);
            audit.setReason(reason);
            audit.setChangedAt(now);
            auditRepository.save(audit);
        }
    }
}
