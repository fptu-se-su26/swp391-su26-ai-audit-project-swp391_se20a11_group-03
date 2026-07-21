package com.auction.bidding.util;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Single source of truth for auction lifecycle deadlines.
 *
 * <p>Boundary rules are intentionally strict: a deposit is accepted only before
 * the cutoff, bidding is accepted in {@code [startTime, endTime)}, and payment is
 * accepted only before the payment deadline.</p>
 */
public final class AuctionTimingPolicy {

    public static final Duration LIVE_DURATION = Duration.ofMinutes(3);
    public static final Duration LIVE_BID_EXTENSION = Duration.ofSeconds(10);
    public static final Duration DEPOSIT_CUTOFF = Duration.ofMinutes(1);
    public static final Duration PAYMENT_WINDOW = Duration.ofHours(72);

    private AuctionTimingPolicy() {
    }

    public static LocalDateTime liveEndAt(LocalDateTime startTime) {
        return requireTime(startTime, "startTime").plus(LIVE_DURATION);
    }

    /** Every successful LIVE bid extends the persisted end time by exactly 10 seconds. */
    public static LocalDateTime extendLiveEnd(LocalDateTime currentEndTime) {
        return requireTime(currentEndTime, "currentEndTime").plus(LIVE_BID_EXTENSION);
    }

    public static LocalDateTime depositDeadline(LocalDateTime startTime) {
        return requireTime(startTime, "startTime").minus(DEPOSIT_CUTOFF);
    }

    public static boolean isDepositOpen(LocalDateTime startTime, LocalDateTime now) {
        return requireTime(now, "now").isBefore(depositDeadline(startTime));
    }

    public static LocalDateTime paymentDeadline(LocalDateTime endTime) {
        return requireTime(endTime, "endTime").plus(PAYMENT_WINDOW);
    }

    public static boolean isPaymentExpired(LocalDateTime paymentDeadline, LocalDateTime now) {
        return !requireTime(now, "now").isBefore(requireTime(paymentDeadline, "paymentDeadline"));
    }

    private static LocalDateTime requireTime(LocalDateTime value, String name) {
        return Objects.requireNonNull(value, name + " must not be null");
    }
}
