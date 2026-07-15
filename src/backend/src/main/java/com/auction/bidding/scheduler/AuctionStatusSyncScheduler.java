package com.auction.bidding.scheduler;

import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.service.AuctionSettlementService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Periodically reconciles the denormalized {@code Auctions.Status} column with the
 * actual lifecycle of each session computed from {@code StartTime} / {@code EndTime}.
 *
 * <p>The legacy {@link com.auction.bidding.entity.Auction} entity and the newer
 * {@link com.auction.bidding.entity.AuctionSession} entity both map the same
 * physical table, so the storefront ({@code /}, {@code /upcoming}, {@code /results})
 * reads {@code Auction.status} directly. This scheduler keeps that column honest.
 */
@Component
@RequiredArgsConstructor
public class AuctionStatusSyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(AuctionStatusSyncScheduler.class);

    private final AuctionRepository auctionRepository;
    private final AuctionSettlementService auctionSettlementService;

    @Scheduled(fixedRateString = "${auction.scheduler.fixed-rate-ms:60000}",
            initialDelayString = "${auction.scheduler.initial-delay-ms:5000}")
    @Transactional
    public void reconcileStatuses() {
        LocalDateTime now = LocalDateTime.now();
        try {
            int expired = auctionRepository.markExpiredAsEnded(now);
            int started = auctionRepository.markStartedAsActive(now);
            int future = auctionRepository.markFutureAsUpcoming(now);
            if (expired + started + future > 0) {
                log.info("Auction status sync: ended={} active={} upcoming={}", expired, started, future);
            }
            int settled = auctionSettlementService.settleEndedAuctions();
            if (settled > 0) {
                log.info("Auction settlement after status sync: settled={}", settled);
            }
        } catch (Exception ex) {
            log.warn("Auction status sync skipped due to error: {}", ex.getMessage());
        }
    }
}
