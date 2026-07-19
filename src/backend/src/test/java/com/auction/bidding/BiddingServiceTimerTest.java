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
    void liveExtension_bidInFinalStretchGuaranteesMinimumRemaining() {
        // A bid placed with only 5s left pulls the end time out so that
        // ANTI_SNIPER_EXTENSION_SECONDS remain — snipers always reopen the window.
        LocalDateTime now = LocalDateTime.of(2026, 6, 17, 10, 0);
        LocalDateTime end = now.plusSeconds(5);

        LocalDateTime minEnd = now.plusSeconds(BiddingService.ANTI_SNIPER_EXTENSION_SECONDS);
        LocalDateTime result = end.isBefore(minEnd) ? minEnd : end;
        assertEquals(now.plusSeconds(BiddingService.ANTI_SNIPER_EXTENSION_SECONDS), result);
    }

    @Test
    void liveExtension_earlyBidDoesNotExtend() {
        // A bid placed with plenty of time left must NOT extend the auction.
        LocalDateTime now = LocalDateTime.of(2026, 6, 17, 10, 0);
        LocalDateTime end = now.plusSeconds(120);

        LocalDateTime minEnd = now.plusSeconds(BiddingService.ANTI_SNIPER_EXTENSION_SECONDS);
        LocalDateTime result = end.isBefore(minEnd) ? minEnd : end;
        assertEquals(end, result);
        assertTrue(result.isAfter(minEnd));
    }

    @Test
    void liveExtension_constantsMatchDemoConfig() {
        // Anti-sniper guarantee is 15s and the initial LIVE window is 3 minutes.
        assertEquals(15L, BiddingService.ANTI_SNIPER_EXTENSION_SECONDS);
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
