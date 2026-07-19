package com.auction.bidding.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DepositCalculatorTest {

    @Test
    void charges10PercentFlat() {
        assertEquals(1_000_000L, DepositCalculator.calculate(10_000_000L));
        assertEquals(5_000_000L, DepositCalculator.calculate(50_000_000L));
        assertEquals(100_000L, DepositCalculator.calculate(1_000_000L));
        assertEquals(50_000L, DepositCalculator.calculate(500_000L));
    }

    @Test
    void describeTier_alwaysTenPercent() {
        assertEquals("10%", DepositCalculator.describeTier(500_000L));
        assertEquals("10%", DepositCalculator.describeTier(3_000_000L));
        assertEquals("10%", DepositCalculator.describeTier(10_000_000L));
    }
}
