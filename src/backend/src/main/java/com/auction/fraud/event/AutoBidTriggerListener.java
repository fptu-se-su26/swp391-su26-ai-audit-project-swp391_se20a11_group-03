package com.auction.fraud.event;

import com.auction.bidding.dto.BidRequest;
import com.auction.bidding.entity.AuctionMode;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.AuctionStatus;
import com.auction.bidding.entity.AutoBid;
import com.auction.bidding.entity.AutoBidStatus;
import com.auction.bidding.entity.Bid;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.repository.AutoBidRepository;
import com.auction.bidding.repository.BidRepository;
import com.auction.bidding.service.BiddingService;
import com.auction.bidding.util.StepCalculator;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * Proxy (auto) bidding: whenever a bid is committed, check whether any Premium
 * user's active auto-bid should now counter-bid to reclaim the lead. Placing
 * the counter-bid publishes another {@link BidCreatedEvent}, so a chain of
 * competing auto-bids resolves itself recursively, one minimum increment at a
 * time, until only the highest max (or a human bidder) remains ahead —
 * classic English-auction proxy bidding, not a jump straight to the cap.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AutoBidTriggerListener {

    private final BidRepository bidRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final AutoBidRepository autoBidRepository;
    private final ProductRepository productRepository;
    private final BiddingService biddingService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handle(BidCreatedEvent event) {
        Bid bid = bidRepository.findById(event.bidId()).orElse(null);
        if (bid == null) {
            return;
        }
        AuctionSession auction = auctionSessionRepository.findById(bid.getAuctionId()).orElse(null);
        if (auction == null || auction.getStatus() != AuctionStatus.ACTIVE) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        if (auction.getEndTime() != null && !now.isBefore(auction.getEndTime())) {
            return;
        }

        Long leaderId = auction.getCurrentWinnerUserId();
        List<AutoBid> candidates = autoBidRepository
                .findByAuctionIdAndStatus(auction.getAuctionId(), AutoBidStatus.ACTIVE)
                .stream()
                .filter(a -> leaderId == null || !leaderId.equals(a.getUserId()))
                .toList();
        if (candidates.isEmpty()) {
            return;
        }

        long requiredMinBid = computeMinNextBid(auction);

        AutoBid best = null;
        for (AutoBid candidate : candidates) {
            if (candidate.getMaxBidAmount() == null || candidate.getMaxBidAmount() < requiredMinBid) {
                candidate.setStatus(AutoBidStatus.EXHAUSTED);
                candidate.setUpdatedAt(now);
                autoBidRepository.save(candidate);
                continue;
            }
            if (best == null || candidate.getMaxBidAmount() > best.getMaxBidAmount()) {
                best = candidate;
            }
        }
        if (best == null) {
            return;
        }

        BidRequest request = new BidRequest();
        request.setAuctionId(auction.getAuctionId());
        request.setUserId(best.getUserId());
        request.setBidAmount(requiredMinBid);
        var response = biddingService.placeBid(request);
        if (!response.isSuccess()) {
            log.warn("Auto-bid counter-bid rejected for auction {} user {}: {}",
                    auction.getAuctionId(), best.getUserId(), response.getMessage());
        }
    }

    /** Mirrors the min-next-bid rule BiddingService.placeBid enforces, for both auction modes. */
    private long computeMinNextBid(AuctionSession auction) {
        Product product = productRepository.findById(auction.getProductId()).orElse(null);
        long startingPrice = product != null && product.getStartingPrice() != null ? product.getStartingPrice() : 0L;
        long current = auction.getCurrentHighestBid() == null ? 0L : auction.getCurrentHighestBid();
        boolean hasPriorBids = auction.getCurrentWinnerUserId() != null;
        if (auction.getAuctionMode() == AuctionMode.TIMED) {
            return StepCalculator.computeTimedMinNextBid(startingPrice, current, hasPriorBids);
        }
        long step = StepCalculator.calculate(startingPrice);
        return StepCalculator.computeMinNextBid(startingPrice, current, step);
    }
}
