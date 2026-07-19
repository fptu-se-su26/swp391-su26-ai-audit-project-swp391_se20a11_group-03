package com.auction.bidding.util;

/**
 * Calculates the minimum bid increment (step) for an auction based on the
 * product's starting price.
 *
 * <ul>
 *   <li>startingPrice &lt; 10,000,000 VND -> step 100,000 VND</li>
 *   <li>10,000,000 &le; startingPrice &lt; 100,000,000 VND -> step 500,000 VND</li>
 *   <li>100,000,000 &le; startingPrice &lt; 1,000,000,000 VND -> step 5,000,000 VND</li>
 *   <li>startingPrice &ge; 1,000,000,000 VND -> step 10,000,000 VND</li>
 * </ul>
 */
public final class StepCalculator {

    public static final long TIER_1_THRESHOLD = 10_000_000L;    // 10 trieu
    public static final long TIER_2_THRESHOLD = 100_000_000L;   // 100 trieu
    public static final long TIER_3_THRESHOLD = 1_000_000_000L; // 1 ty

    public static final long STEP_MICRO = 100_000L;     // 100 nghin
    public static final long STEP_SMALL = 500_000L;     // 500 nghin
    public static final long STEP_MEDIUM = 5_000_000L;  // 5 trieu
    public static final long STEP_LARGE = 10_000_000L;  // 10 trieu

    private StepCalculator() {
    }

    public static long calculate(long startingPrice) {
        if (startingPrice < TIER_1_THRESHOLD) {
            return STEP_MICRO;
        }
        if (startingPrice < TIER_2_THRESHOLD) {
            return STEP_SMALL;
        }
        if (startingPrice < TIER_3_THRESHOLD) {
            return STEP_MEDIUM;
        }
        return STEP_LARGE;
    }

    /** Fixed step for the whole auction; next bid = max(current, starting) + step. */
    public static long computeMinNextBid(long startingPrice, long currentHighestBid, long step) {
        long base = Math.max(currentHighestBid, startingPrice);
        return base + step;
    }

    /**
     * TIMED (open) auctions use a dynamic step: 5% of the current price,
     * rounded up to the nearest 1,000 VND so amounts stay tidy.
     */
    public static long timedStep(long currentPrice) {
        long step = (long) Math.ceil(currentPrice * 0.05 / 1_000.0) * 1_000L;
        return Math.max(step, 1_000L);
    }

    /**
     * Minimum next bid for a TIMED auction: the first bid may equal the
     * starting price; afterwards each bid must top the current price by 5%.
     */
    public static long computeTimedMinNextBid(long startingPrice, long currentHighestBid, boolean hasBids) {
        if (!hasBids || currentHighestBid <= 0) {
            return startingPrice;
        }
        return currentHighestBid + timedStep(currentHighestBid);
    }

    public static boolean isOnBidGrid(long startingPrice, long bidAmount, long step) {
        return (bidAmount - startingPrice) % step == 0;
    }
}
