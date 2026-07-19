package com.auction.bidding;

import com.auction.bidding.service.BiddingService;
import com.auction.bidding.entity.AuctionMode;
import com.auction.bidding.util.AuctionTimingPolicy;
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
    void liveExtension_eachSuccessfulBidAddsExactlyTenSeconds() {
        LocalDateTime end = LocalDateTime.of(2026, 6, 17, 10, 3);

        LocalDateTime result = AuctionTimingPolicy.extendLiveEnd(end);

        assertEquals(end.plusSeconds(10), result);
    }

    @Test
    void liveExtension_multipleBidsStackWithoutLosingTime() {
        LocalDateTime end = LocalDateTime.of(2026, 6, 17, 10, 3);

        LocalDateTime afterTwoBids = AuctionTimingPolicy.extendLiveEnd(
                AuctionTimingPolicy.extendLiveEnd(end));

        assertEquals(end.plusSeconds(20), afterTwoBids);
    }

    @Test
    void liveExtension_constantsMatchDemoConfig() {
        assertEquals(10L, BiddingService.LIVE_BID_EXTENSION_SECONDS);
        assertEquals(180L, BiddingService.INITIAL_AUCTION_DURATION_SECONDS);
        assertEquals(1L, BiddingService.DEPOSIT_DEADLINE_BEFORE_START_MINUTES);
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
