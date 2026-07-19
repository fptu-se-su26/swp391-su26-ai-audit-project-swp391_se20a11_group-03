package com.auction.fraud.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateFraudSettingsRequest(
        boolean detectionEnabled,
        boolean autoRestrictionEnabled,
        boolean alertEnabled,
        @NotBlank @Size(max = 500) String reason
) {
}
