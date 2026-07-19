package com.auction.premium.service;

public final class PremiumPolicy {
    private PremiumPolicy() {}

    public static long deposit(long startingPrice, long standardDeposit, boolean premium) {
        if (!premium) return standardDeposit;
        return startingPrice < 1_000_000L ? 0L : standardDeposit / 2L;
    }

    public static long commission(long finalPrice, boolean premium) {
        int percent = premium ? 5 : 20;
        return Math.round(finalPrice * (percent / 100.0d));
    }

    public static long autoBidPrice(long currentPrice, long winnerMax, long opponentMax,
                                    long startingPrice, long step) {
        long candidate = Math.min(winnerMax, Math.max(currentPrice, opponentMax) + step);
        candidate -= Math.floorMod(candidate - startingPrice, step);
        return candidate;
    }
}
