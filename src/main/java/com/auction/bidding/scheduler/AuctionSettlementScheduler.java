package com.auction.bidding.scheduler;

import com.auction.bidding.service.AuctionSettlementService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuctionSettlementScheduler {

    private static final Logger log = LoggerFactory.getLogger(AuctionSettlementScheduler.class);

    private final AuctionSettlementService auctionSettlementService;

    /** Every 30 seconds, settle auctions whose endTime has passed. */
    @Scheduled(fixedRate = 30_000L, initialDelay = 15_000L)
    public void settleEnded() {
        try {
            int n = auctionSettlementService.settleEndedAuctions();
            if (n > 0) log.info("Settled {} ended auction(s)", n);
        } catch (Exception e) {
            log.error("settleEnded failed", e);
        }
    }

    /** Every 5 minutes, forfeit any AWAITING_PAYMENT auction whose 3-day deadline has passed. */
    @Scheduled(fixedRate = 300_000L, initialDelay = 60_000L)
    public void forfeitExpired() {
        try {
            int n = auctionSettlementService.forfeitExpiredAuctions();
            if (n > 0) log.info("Forfeited {} unpaid auction(s)", n);
        } catch (Exception e) {
            log.error("forfeitExpired failed", e);
        }
    }
}
