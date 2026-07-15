package com.auction.bidding.util;

import com.auction.bidding.entity.AuctionMode;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.AuctionStatus;

import java.time.LocalDateTime;

public final class AuctionPhaseUtil {

    private AuctionPhaseUtil() {
    }

    /**
     * TIMED auctions are now OPEN (English auction): the highest bid and bid
     * history are public so buyers can react, and the 5%-of-current-price step
     * can be computed client-side. Sealed (blind) bidding has been retired —
     * this always returns {@code false} and is kept only so existing call
     * sites keep compiling and can be cleaned up incrementally.
     */
    public static boolean isTimedBlindBiddingOpen(AuctionSession auction) {
        return false;
    }

    public static boolean isAuctionEndedForReveal(AuctionSession auction) {
        if (auction == null) {
            return true;
        }
        LocalDateTime now = LocalDateTime.now();
        if (auction.getEndTime() != null && !now.isBefore(auction.getEndTime())) {
            return true;
        }
        if (auction.getStatus() == AuctionStatus.ENDED
                || auction.getStatus() == AuctionStatus.AWAITING_PAYMENT
                || auction.getStatus() == AuctionStatus.PAID
                || auction.getStatus() == AuctionStatus.FORFEITED) {
            return true;
        }
        return false;
    }
}
