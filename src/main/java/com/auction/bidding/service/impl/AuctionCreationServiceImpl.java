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
import java.util.Optional;

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

        long durationSeconds = resolveDurationSeconds(mode, scheduledDurationSeconds);
        LocalDateTime endTime = startTime.plusSeconds(durationSeconds);

        Optional<Auction> existingOpt = auctionRepository.findByProduct_ProductId(productId);
        if (existingOpt.isPresent()) {
            Auction existing = existingOpt.get();
            if (isReschedulable(existing)) {
                return resetForfeitedAuction(existing, product, mode, startTime, scheduledDurationSeconds, durationSeconds, endTime);
            }
            throw new BusinessException("Auction already exists for product " + productId);
        }

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

        createOrUpdateSession(saved.getAuctionId(), productId, mode, scheduledDurationSeconds, startTime, endTime,
                product.getStartingPrice(), AuctionStatus.UPCOMING, LocalDateTime.now());

        return saved;
    }

    private boolean isReschedulable(Auction auction) {
        if ("FORFEITED".equalsIgnoreCase(auction.getStatus())) {
            return true;
        }
        return "ENDED".equalsIgnoreCase(auction.getStatus())
                && "NO_WINNER".equalsIgnoreCase(auction.getPaymentStatus());
    }

    private Auction resetForfeitedAuction(
            Auction auction,
            Product product,
            AuctionMode mode,
            LocalDateTime startTime,
            Long scheduledDurationSeconds,
            long durationSeconds,
            LocalDateTime endTime) {
        auction.setAuctionMode(mode);
        auction.setScheduledDurationSeconds(mode == AuctionMode.TIMED ? scheduledDurationSeconds : null);
        auction.setStartTime(startTime);
        auction.setEndTime(endTime);
        auction.setCurrentHighestBid(product.getStartingPrice());
        auction.setCurrentWinnerUser(null);
        auction.setStatus("UPCOMING");
        auction.setPaymentStatus(null);
        auction.setPaymentDeadline(null);
        auction.setSettledAt(null);
        Auction saved = auctionRepository.save(auction);

        createOrUpdateSession(saved.getAuctionId(), product.getProductId(), mode, scheduledDurationSeconds, startTime, endTime,
                product.getStartingPrice(), AuctionStatus.UPCOMING, saved.getCreatedAt() != null ? saved.getCreatedAt() : LocalDateTime.now());

        return saved;
    }

    private void createOrUpdateSession(
            Long auctionId,
            Long productId,
            AuctionMode mode,
            Long scheduledDurationSeconds,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Long startingPrice,
            AuctionStatus status,
            LocalDateTime createdAt) {
        AuctionSession session = auctionSessionRepository.findById(auctionId).orElse(new AuctionSession());
        session.setAuctionId(auctionId);
        session.setProductId(productId);
        session.setAuctionMode(mode);
        session.setScheduledDurationSeconds(mode == AuctionMode.TIMED ? scheduledDurationSeconds : null);
        session.setStartTime(startTime);
        session.setEndTime(endTime);
        session.setCurrentHighestBid(startingPrice);
        session.setCurrentWinnerUserId(null);
        session.setStatus(status);
        session.setPaymentStatus(null);
        session.setPaymentDeadline(null);
        session.setSettledAt(null);
        if (session.getCreatedAt() == null) {
            session.setCreatedAt(createdAt);
        }
        auctionSessionRepository.save(session);
    }

    private long resolveDurationSeconds(AuctionMode mode, Long scheduledDurationSeconds) {
        if (mode == AuctionMode.LIVE) {
            return LIVE_DURATION_SECONDS;
        }
        if (scheduledDurationSeconds == null) {
            throw new BusinessException("Timed auctions require scheduledDurationSeconds (21600-43200)");
        }
        if (scheduledDurationSeconds < MIN_TIMED_DURATION_SECONDS || scheduledDurationSeconds > MAX_TIMED_DURATION_SECONDS) {
            throw new BusinessException("Timed auction duration must be between 6 hours (21600s) and 12 hours (43200s)");
        }
        return scheduledDurationSeconds;
    }
}
