package com.auction.bidding.service;

public interface AuctionSettlementService {
    /** Move auctions whose endTime has passed to AWAITING_PAYMENT and set 12h payment deadline. */
    int settleEndedAuctions();

    /** Forfeit winner deposit and refund all losers for auctions whose payment deadline has passed. */
    int forfeitExpiredAuctions();
}
