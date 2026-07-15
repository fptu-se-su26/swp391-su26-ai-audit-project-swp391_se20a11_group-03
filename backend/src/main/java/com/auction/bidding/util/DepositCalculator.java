package com.auction.bidding.util;

/**
 * Calculates the deposit amount required to enter an auction room.
 *
 * <p>Flat 10% of the product's starting price (applied to both LIVE and TIMED auctions).
 */
public final class DepositCalculator {

    /** Deposit rate applied to the starting price. */
    public static final double DEPOSIT_RATE = 0.10d;

    private DepositCalculator() {
    }

    public static long calculate(long startingPrice) {
        return Math.round(startingPrice * DEPOSIT_RATE);
    }

    public static String describeTier(long startingPrice) {
        return "10%";
    }
}
