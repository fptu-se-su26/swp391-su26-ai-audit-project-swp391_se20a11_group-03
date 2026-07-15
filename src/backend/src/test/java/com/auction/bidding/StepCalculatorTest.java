package com.auction.bidding;

import com.auction.bidding.util.StepCalculator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class StepCalculatorTest {

    @Test
    void calculateUsesPriceAppropriateTiers() {
        assertEquals(100_000L, StepCalculator.calculate(9_999_999L));
        assertEquals(500_000L, StepCalculator.calculate(10_000_000L));
        assertEquals(500_000L, StepCalculator.calculate(99_999_999L));
        assertEquals(5_000_000L, StepCalculator.calculate(100_000_000L));
        assertEquals(10_000_000L, StepCalculator.calculate(1_000_000_000L));
    }

    @Test
    void tenMillionProductStartsAtTenMillionFiveHundredThousand() {
        long startingPrice = 10_000_000L;
        long step = StepCalculator.calculate(startingPrice);

        assertEquals(10_500_000L,
                StepCalculator.computeMinNextBid(startingPrice, startingPrice, step));
        assertTrue(StepCalculator.isOnBidGrid(startingPrice, 10_500_000L, step));
        assertFalse(StepCalculator.isOnBidGrid(startingPrice, 10_250_000L, step));
    }
}
