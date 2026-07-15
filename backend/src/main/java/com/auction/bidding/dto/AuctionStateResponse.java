package com.auction.bidding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Snapshot of an auction's current state — polled by the frontend every 2s.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionStateResponse {
    private Long auctionId;
    private Long productId;
    private String auctionMode;          // LIVE | TIMED
    private String status;                // UPCOMING | ACTIVE | ENDED | AWAITING_PAYMENT | FORFEITED | PAID
    private String paymentStatus;         // null | AWAITING_PAYMENT | PAID | FORFEITED | NO_WINNER
    private Long startingPrice;
    private Long bidStep;
    private Long minNextBid;
    private Long currentHighestBid;
    private Long currentWinnerUserId;
    private String winnerUsername;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime paymentDeadline;
    private Long totalBids;
    private LocalDateTime serverNow;
    /** TIMED blind phase: true while auction is open — clients must not show live highest bid. */
    private Boolean priceHidden;
    private Boolean bidsAnonymous;
}
