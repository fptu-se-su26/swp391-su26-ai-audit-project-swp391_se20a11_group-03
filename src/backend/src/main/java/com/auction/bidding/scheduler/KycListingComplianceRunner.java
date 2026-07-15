package com.auction.bidding.scheduler;

import com.auction.bidding.service.AuctionSettlementService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** Repairs stale listings that were approved before strict KYC enforcement. */
@Component
@RequiredArgsConstructor
public class KycListingComplianceRunner implements ApplicationRunner {

    private static final Logger log =
            LoggerFactory.getLogger(KycListingComplianceRunner.class);

    private final AuctionSettlementService auctionSettlementService;

    @Override
    public void run(ApplicationArguments args) {
        int affected = auctionSettlementService.reconcileKycIneligibleSellerListings();
        if (affected > 0) {
            log.warn("Removed {} pending/open listings with invalid seller KYC", affected);
        }
    }
}
