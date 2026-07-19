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

    /** Short LIVE auctions are settled promptly so all viewers receive the result event. */
    @Scheduled(fixedRateString = "${auction.settlement.fixed-rate-ms:2000}",
            initialDelayString = "${auction.settlement.initial-delay-ms:2000}")
    public void settleEnded() {
        try {
            int n = auctionSettlementService.settleEndedAuctions();
            if (n > 0) log.info("Settled {} ended auction(s)", n);
        } catch (Exception e) {
            log.error("settleEnded failed", e);
        }
    }

    /** Enforce the 72-hour payment deadline with a short, configurable reconciliation delay. */
    @Scheduled(fixedRateString = "${auction.payment-expiry.fixed-rate-ms:30000}",
            initialDelayString = "${auction.payment-expiry.initial-delay-ms:30000}")
    public void forfeitExpired() {
        try {
            int n = auctionSettlementService.forfeitExpiredAuctions();
            if (n > 0) log.info("Forfeited {} unpaid auction(s)", n);
        } catch (Exception e) {
            log.error("forfeitExpired failed", e);
        }
    }
}
