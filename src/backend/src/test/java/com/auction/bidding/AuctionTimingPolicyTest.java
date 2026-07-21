package com.auction.bidding;

import com.auction.bidding.util.AuctionTimingPolicy;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuctionTimingPolicyTest {

    private static final LocalDateTime START = LocalDateTime.of(2026, 7, 20, 10, 0);

    @Test
    void liveAuctionRunsForThreeMinutes() {
        assertEquals(START.plusMinutes(3), AuctionTimingPolicy.liveEndAt(START));
    }

    @Test
    void depositIsAcceptedOnlyBeforeTheOneMinuteCutoff() {
        LocalDateTime cutoff = START.minusMinutes(1);

        assertTrue(AuctionTimingPolicy.isDepositOpen(START, cutoff.minusNanos(1)));
        assertFalse(AuctionTimingPolicy.isDepositOpen(START, cutoff));
        assertFalse(AuctionTimingPolicy.isDepositOpen(START, cutoff.plusSeconds(1)));
    }

    @Test
    void paymentExpiresAtTheExactSeventyTwoHourBoundary() {
        LocalDateTime end = AuctionTimingPolicy.liveEndAt(START);
        LocalDateTime deadline = AuctionTimingPolicy.paymentDeadline(end);

        assertEquals(end.plusHours(72), deadline);
        assertFalse(AuctionTimingPolicy.isPaymentExpired(deadline, deadline.minusNanos(1)));
        assertTrue(AuctionTimingPolicy.isPaymentExpired(deadline, deadline));
    }
}
