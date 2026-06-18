package com.auction.bidding.service.impl;

import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionMode;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.AuctionStatus;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.service.AuctionCreationService;
import com.auction.common.exception.BusinessException;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuctionCreationServiceImpl implements AuctionCreationService {

    /** LIVE: 3 minutes countdown once opened. */
    public static final long LIVE_DURATION_SECONDS = 180L;
    /** TIMED: minimum 6 hours. */
    public static final long MIN_TIMED_DURATION_SECONDS = 6L * 60L * 60L;
    /** TIMED: maximum 12 hours. */
    public static final long MAX_TIMED_DURATION_SECONDS = 12L * 60L * 60L;
    /** Auctions must be scheduled at least 5 minutes in advance. */
    public static final long MIN_LEAD_MINUTES = 5L;

    private final ProductRepository productRepository;
    private final AuctionRepository auctionRepository;
    private final AuctionSessionRepository auctionSessionRepository;

    @Override
    @Transactional
    public Auction createForApprovedProduct(Long productId, AuctionMode mode, LocalDateTime startTime, Long scheduledDurationSeconds) {
        if (mode == null) {
            throw new BusinessException("Auction mode is required when scheduling an auction");
        }
        if (startTime == null) {
            throw new BusinessException("Scheduled start time is required");
        }

        LocalDateTime minStart = LocalDateTime.now().plusMinutes(MIN_LEAD_MINUTES);
        if (startTime.isBefore(minStart)) {
            throw new BusinessException("Scheduled start time must be at least " + MIN_LEAD_MINUTES + " minutes in the future");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("Product not found with id: " + productId));

        auctionRepository.findByProduct_ProductId(productId).ifPresent(existing -> {
            throw new BusinessException("Auction already exists for product " + productId);
        });

        long durationSeconds;
        if (mode == AuctionMode.LIVE) {
            durationSeconds = LIVE_DURATION_SECONDS;
        } else {
            if (scheduledDurationSeconds == null) {
                throw new BusinessException("Timed auctions require scheduledDurationSeconds (21600-43200)");
            }
            if (scheduledDurationSeconds < MIN_TIMED_DURATION_SECONDS || scheduledDurationSeconds > MAX_TIMED_DURATION_SECONDS) {
                throw new BusinessException("Timed auction duration must be between 6 hours (21600s) and 12 hours (43200s)");
            }
            durationSeconds = scheduledDurationSeconds;
        }

        LocalDateTime endTime = startTime.plusSeconds(durationSeconds);

        Auction auction = new Auction();
        auction.setProduct(product);
        auction.setAuctionMode(mode);
        auction.setScheduledDurationSeconds(mode == AuctionMode.TIMED ? scheduledDurationSeconds : null);
        auction.setStartTime(startTime);
        auction.setEndTime(endTime);
        auction.setCurrentHighestBid(product.getStartingPrice());
        auction.setStatus("UPCOMING");
        auction.setCreatedAt(LocalDateTime.now());
        Auction saved = auctionRepository.save(auction);

        // Mirror into AuctionSession so BiddingService.placeBid() can lock and update the row
        AuctionSession session = new AuctionSession();
        session.setAuctionId(saved.getAuctionId());
        session.setProductId(productId);
        session.setAuctionMode(mode);
        session.setScheduledDurationSeconds(saved.getScheduledDurationSeconds());
        session.setStartTime(startTime);
        session.setEndTime(endTime);
        session.setCurrentHighestBid(product.getStartingPrice());
        session.setStatus(AuctionStatus.UPCOMING);
        session.setCreatedAt(LocalDateTime.now());
        auctionSessionRepository.save(session);

        return saved;
    }
}
