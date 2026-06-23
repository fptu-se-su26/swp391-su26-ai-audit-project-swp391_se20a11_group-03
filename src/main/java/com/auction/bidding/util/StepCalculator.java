package com.auction.bidding.util;

/**
 * Calculates the minimum bid increment (step) for an auction based on the
 * product's starting price.
 *
 * <ul>
 *   <li>startingPrice &lt; 100,000,000 VND  -> step 5,000,000 VND</li>
 *   <li>100,000,000 &le; startingPrice &lt; 1,000,000,000 VND -> step 10,000,000 VND</li>
 *   <li>startingPrice &ge; 1,000,000,000 VND -> step 50,000,000 VND</li>
 * </ul>
 */
public final class StepCalculator {

    public static final long TIER_1_THRESHOLD = 100_000_000L;   // 100 trieu
    public static final long TIER_2_THRESHOLD = 1_000_000_000L; // 1 ty

    public static final long STEP_SMALL = 5_000_000L;   // 5 trieu
    public static final long STEP_MEDIUM = 10_000_000L; // 10 trieu
    public static final long STEP_LARGE = 50_000_000L;  // 50 trieu

    private StepCalculator() {
    }

    public static long calculate(long startingPrice) {
        if (startingPrice < TIER_1_THRESHOLD) {
            return STEP_SMALL;
        }
        if (startingPrice < TIER_2_THRESHOLD) {
            return STEP_MEDIUM;
        }
        return STEP_LARGE;
    }
}
