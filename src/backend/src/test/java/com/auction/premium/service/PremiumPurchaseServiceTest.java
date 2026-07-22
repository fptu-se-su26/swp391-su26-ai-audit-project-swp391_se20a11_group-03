package com.auction.premium.service;

import com.auction.premium.dto.PremiumPlan;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PremiumPurchaseServiceTest {

    @Test
    void pricesMatchThePremiumPolicy() {
        assertEquals(10_000_000L, PremiumPurchaseService.USER_MONTHLY_PRICE);
        assertEquals(100_000_000L, PremiumPurchaseService.USER_YEARLY_PRICE);
        assertEquals(30_000_000L, PremiumPurchaseService.SELLER_MONTHLY_PRICE);
        assertEquals(300_000_000L, PremiumPurchaseService.SELLER_YEARLY_PRICE);
    }

    @Test
    void activeSubscriptionIsExtendedFromItsCurrentExpiration() {
        LocalDateTime purchaseTime = LocalDateTime.of(2026, 7, 22, 10, 0);
        LocalDateTime currentExpiration = purchaseTime.plusDays(10);

        assertEquals(
                currentExpiration.plusMonths(1),
                PremiumPurchaseService.extendExpiration(currentExpiration, purchaseTime, PremiumPlan.MONTHLY)
        );
    }

    @Test
    void expiredSubscriptionRestartsAtPurchaseTime() {
        LocalDateTime purchaseTime = LocalDateTime.of(2026, 7, 22, 10, 0);
        LocalDateTime expiredAt = purchaseTime.minusDays(1);

        assertEquals(
                purchaseTime.plusYears(1),
                PremiumPurchaseService.extendExpiration(expiredAt, purchaseTime, PremiumPlan.YEARLY)
        );
    }
}
