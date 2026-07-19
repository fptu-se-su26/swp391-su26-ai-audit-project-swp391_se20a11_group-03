package com.auction.premium;

import com.auction.premium.service.PremiumPolicy;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class PremiumPolicyTest {
    @Test void regularUserPaysFullDeposit() { assertEquals(200_000L, PremiumPolicy.deposit(500_000L, 200_000L, false)); }
    @Test void premiumBelowOneMillionPaysNoDeposit() { assertEquals(0L, PremiumPolicy.deposit(999_999L, 200_000L, true)); }
    @Test void premiumAtThresholdPaysHalfDeposit() { assertEquals(100_000L, PremiumPolicy.deposit(1_000_000L, 200_000L, true)); }
    @Test void regularCommissionIsTwentyPercent() { assertEquals(200_000L, PremiumPolicy.commission(1_000_000L, false)); }
    @Test void premiumCommissionIsFivePercent() { assertEquals(50_000L, PremiumPolicy.commission(1_000_000L, true)); }
    @Test void twoAutoBiddersJumpPastLowerMaximumWithoutLooping() {
        assertEquals(95_000_000L, PremiumPolicy.autoBidPrice(10_000_000L, 100_000_000L,
                90_000_000L, 5_000_000L, 5_000_000L));
    }
    @Test void autoBidNeverExceedsWinnerMaximum() {
        assertEquals(92_000_000L, PremiumPolicy.autoBidPrice(10_000_000L, 92_000_000L,
                90_000_000L, 2_000_000L, 5_000_000L));
    }
}
