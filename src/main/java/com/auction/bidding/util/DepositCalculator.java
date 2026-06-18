package com.auction.bidding.util;

/**
 * Calculates the deposit amount required to enter an auction room.
 *
 * <p>Tiers (applied to both LIVE and TIMED auctions):
 * <ul>
 *   <li>startingPrice &lt; 1,000,000 VND → 30%</li>
 *   <li>1,000,000 ≤ startingPrice ≤ 5,000,000 VND → 15%</li>
 *   <li>startingPrice &gt; 5,000,000 VND → 10%</li>
 * </ul>
 */
public final class DepositCalculator {

    public static final long TIER_1_THRESHOLD = 1_000_000L;
    public static final long TIER_2_THRESHOLD = 5_000_000L;

    private DepositCalculator() {
    }

    public static long calculate(long startingPrice) {
        if (startingPrice < TIER_1_THRESHOLD) {
            return Math.round(startingPrice * 0.30d);
        }
        if (startingPrice <= TIER_2_THRESHOLD) {
            return Math.round(startingPrice * 0.15d);
        }
        return Math.round(startingPrice * 0.10d);
    }

    public static String describeTier(long startingPrice) {
        if (startingPrice < TIER_1_THRESHOLD) return "30%";
        if (startingPrice <= TIER_2_THRESHOLD) return "15%";
        return "10%";
    }
}
