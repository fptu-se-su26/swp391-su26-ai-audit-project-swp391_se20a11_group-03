package com.auction.fraud.dto;

import java.time.LocalDateTime;

public record FraudSettingsResponse(
        boolean detectionEnabled,
        boolean autoRestrictionEnabled,
        boolean alertEnabled,
        LocalDateTime updatedAt
) {
}
