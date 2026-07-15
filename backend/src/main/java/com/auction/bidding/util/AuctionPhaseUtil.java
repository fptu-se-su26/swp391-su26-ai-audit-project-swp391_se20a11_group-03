package com.auction.bidding.util;

import com.auction.bidding.entity.AuctionMode;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.AuctionStatus;

import java.time.LocalDateTime;

public final class AuctionPhaseUtil {

    private AuctionPhaseUtil() {
    }

    /** TIMED auction still accepting bids — prices and bidders stay hidden from the public API. */
    public static boolean isTimedBlindBiddingOpen(AuctionSession auction) {
        if (auction == null || auction.getAuctionMode() != AuctionMode.TIMED) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        if (auction.getStartTime() == null || auction.getEndTime() == null) {
            return false;
        }
        return !now.isBefore(auction.getStartTime()) && now.isBefore(auction.getEndTime());
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
