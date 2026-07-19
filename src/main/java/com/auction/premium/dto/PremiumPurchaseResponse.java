package com.auction.premium.dto;

import java.time.LocalDateTime;

public record PremiumPurchaseResponse(boolean premium, long monthlyPrice, long yearlyPrice,
                                      long yearlySaving, long remainingBalance,
                                      LocalDateTime expiresAt, String accountType, String message) {}
