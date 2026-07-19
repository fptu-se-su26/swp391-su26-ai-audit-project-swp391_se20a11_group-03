package com.auction.bidding;

import com.auction.bidding.service.impl.AuctionSettlementServiceImpl;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuctionSettlementServiceTest {

    @Test
    void paymentWindow_isThreeDays() {
        assertEquals(72L, AuctionSettlementServiceImpl.PAYMENT_WINDOW_HOURS);
    }

    @Test
    void settlementConstants_areSane() {
        // We just check the invariants — the actual forfeit/refund flows are integration-tested
        // via curl in the smoke test.
        assertTrue(AuctionSettlementServiceImpl.PAYMENT_WINDOW_HOURS > 0);
    }
}
