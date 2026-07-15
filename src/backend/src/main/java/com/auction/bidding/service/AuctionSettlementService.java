package com.auction.bidding.service;

public interface AuctionSettlementService {
    /** Move auctions whose endTime has passed to AWAITING_PAYMENT and set 3-day payment deadline. */
    int settleEndedAuctions();

    /** Forfeit winner deposit and refund all losers for auctions whose payment deadline has passed. */
    int forfeitExpiredAuctions();

    /**
     * Remove pending/open listings owned by a seller whose KYC is no longer
     * valid. Open auctions are canceled and all locked deposits are refunded.
     */
    int cancelSellerListingsForKycRevocation(Long sellerId, String reason);

    /** Reconcile listings that were already inconsistent before enforcement was enabled. */
    int reconcileKycIneligibleSellerListings();
}
