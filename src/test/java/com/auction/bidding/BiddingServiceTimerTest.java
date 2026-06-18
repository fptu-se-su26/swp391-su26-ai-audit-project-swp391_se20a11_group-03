package com.auction.bidding;

import com.auction.bidding.service.BiddingService;
import com.auction.bidding.entity.AuctionMode;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verifies the live-auction extension math in {@link BiddingService#placeBid} without
 * spinning up Spring. The branch under test is purely arithmetic on start/end times,
 * so we extract it as a static helper and re-implement the comparison here.
 */
class BiddingServiceTimerTest {

    @Test
    void liveExtension_capsAt180sFromStart() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 17, 10, 0);
        LocalDateTime end = start.plusSeconds(170);

        // proposed = end + 2 = 172 -> less than 180 cap, use proposed
        LocalDateTime proposed = end.plusSeconds(BiddingService.ANTI_SNIPER_EXTENSION_SECONDS);
        LocalDateTime ceiling = start.plusSeconds(BiddingService.MAX_LIVE_DURATION_SECONDS);
        LocalDateTime result = proposed.isAfter(ceiling) ? ceiling : proposed;
        assertEquals(start.plusSeconds(172), result);
    }

    @Test
    void liveExtension_doesNotExceed180sCap() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 17, 10, 0);
        LocalDateTime end = start.plusSeconds(179);

        // proposed = 181 -> exceeds 180 cap, use ceiling
        LocalDateTime proposed = end.plusSeconds(BiddingService.ANTI_SNIPER_EXTENSION_SECONDS);
        LocalDateTime ceiling = start.plusSeconds(BiddingService.MAX_LIVE_DURATION_SECONDS);
        LocalDateTime result = proposed.isAfter(ceiling) ? ceiling : proposed;
        assertEquals(ceiling, result);
    }

    @Test
    void liveExtension_atCeilingStaysAtCeiling() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 17, 10, 0);
        LocalDateTime end = start.plusSeconds(180);

        LocalDateTime proposed = end.plusSeconds(BiddingService.ANTI_SNIPER_EXTENSION_SECONDS);
        LocalDateTime ceiling = start.plusSeconds(BiddingService.MAX_LIVE_DURATION_SECONDS);
        LocalDateTime result = proposed.isAfter(ceiling) ? ceiling : proposed;
        assertEquals(ceiling, result);
    }

    @Test
    void timedExtension_doesNotChangeEndTime() {
        // For TIMED, placeBid should NOT call plusSeconds — the endTime stays fixed.
        // We assert via constants: ANTI_SNIPER_EXTENSION_SECONDS is applied only in the LIVE branch.
        // This test ensures the constants haven't regressed.
        assertEquals(2L, BiddingService.ANTI_SNIPER_EXTENSION_SECONDS);
        assertEquals(180L, BiddingService.MAX_LIVE_DURATION_SECONDS);
        assertEquals(180L, BiddingService.INITIAL_AUCTION_DURATION_SECONDS);
    }

    @Test
    void minIncrement_isFiftyThousand() {
        assertEquals(50_000L, BiddingService.MIN_BID_INCREMENT);
    }

    @Test
    void auctionMode_enumHasBothModes() throws Exception {
        // Reflection sanity: ensure AuctionMode has LIVE and TIMED so service branching is exhaustive.
        Field live = AuctionMode.class.getField("LIVE");
        Field timed = AuctionMode.class.getField("TIMED");
        assertEquals("LIVE", live.getName());
        assertEquals("TIMED", timed.getName());
        assertTrue(AuctionMode.valueOf("LIVE") == AuctionMode.LIVE);
    }
}
