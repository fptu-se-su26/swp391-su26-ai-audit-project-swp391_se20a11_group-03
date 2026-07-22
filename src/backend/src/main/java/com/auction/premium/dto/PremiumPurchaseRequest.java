package com.auction.premium.dto;

import jakarta.validation.constraints.NotNull;

public record PremiumPurchaseRequest(@NotNull PremiumPlan plan) {
}
