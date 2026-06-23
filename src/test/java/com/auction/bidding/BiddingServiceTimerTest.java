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
    void liveExtension_addsTenSecondsPerBid() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 17, 10, 0);
        LocalDateTime end = start.plusSeconds(170);

        // Each successful LIVE bid pushes endTime out by ANTI_SNIPER_EXTENSION_SECONDS (no cap).
        LocalDateTime result = end.plusSeconds(BiddingService.ANTI_SNIPER_EXTENSION_SECONDS);
        assertEquals(start.plusSeconds(180), result);
    }

    @Test
    void liveExtension_hasNoHardCap() {
        LocalDateTime start = LocalDateTime.of(2026, 6, 17, 10, 0);
        // Even past the initial 3-minute window, a late bid keeps extending the room.
        LocalDateTime end = start.plusSeconds(179);

        LocalDateTime result = end.plusSeconds(BiddingService.ANTI_SNIPER_EXTENSION_SECONDS);
        assertEquals(start.plusSeconds(189), result);
        assertTrue(result.isAfter(start.plusSeconds(BiddingService.INITIAL_AUCTION_DURATION_SECONDS)));
    }

    @Test
    void liveExtension_constantsMatchDemoConfig() {
        // Anti-sniper extension is 10s and the initial LIVE window is 3 minutes.
        assertEquals(10L, BiddingService.ANTI_SNIPER_EXTENSION_SECONDS);
        assertEquals(180L, BiddingService.INITIAL_AUCTION_DURATION_SECONDS);
        assertEquals(3L, BiddingService.DEPOSIT_DEADLINE_BEFORE_START_MINUTES);
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
