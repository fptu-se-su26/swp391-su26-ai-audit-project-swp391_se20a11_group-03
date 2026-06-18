package com.auction.bidding.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DepositCalculatorTest {

    @Test
    void under1M_charges30Percent() {
        assertEquals(300_000L, DepositCalculator.calculate(1_000_000L - 1));
        assertEquals(150_000L, DepositCalculator.calculate(500_000L));
        assertEquals(60_000L, DepositCalculator.calculate(200_000L));
    }

    @Test
    void between1Mand5M_charges15Percent() {
        assertEquals(150_000L, DepositCalculator.calculate(1_000_000L));
        assertEquals(750_000L, DepositCalculator.calculate(5_000_000L));
        assertEquals(450_000L, DepositCalculator.calculate(3_000_000L));
    }

    @Test
    void above5M_charges10Percent() {
        assertEquals(1_000_000L, DepositCalculator.calculate(10_000_000L));
        assertEquals(5_000_000L, DepositCalculator.calculate(50_000_000L));
    }

    @Test
    void describeTier_returnsHumanReadablePercent() {
        assertEquals("30%", DepositCalculator.describeTier(500_000L));
        assertEquals("15%", DepositCalculator.describeTier(3_000_000L));
        assertEquals("10%", DepositCalculator.describeTier(10_000_000L));
    }
}
