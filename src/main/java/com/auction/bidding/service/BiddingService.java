package com.auction.bidding.service;

import com.auction.bidding.dto.AuctionSessionDto;
import com.auction.bidding.dto.BidRequest;
import com.auction.bidding.dto.BidResponse;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.AuctionStatus;
import com.auction.bidding.entity.Bid;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.repository.BidRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class BiddingService {
    public static final long MIN_BID_INCREMENT = 1_000_000L;
    public static final long INITIAL_AUCTION_DURATION_SECONDS = 120L;
    public static final long ANTI_SNIPER_EXTENSION_SECONDS = 10L;
    public static final long DEPOSIT_DEADLINE_BEFORE_START_MINUTES = 30L;

    private final AuctionSessionRepository auctionSessionRepository;
    private final BidRepository bidRepository;
    private final ReentrantLock auctionLock = new ReentrantLock(true);

    public BiddingService(AuctionSessionRepository auctionSessionRepository, BidRepository bidRepository) {
        this.auctionSessionRepository = auctionSessionRepository;
        this.bidRepository = bidRepository;
    }

    public List<AuctionSessionDto> getOpenRooms() {
        return auctionSessionRepository.findOpenRooms().stream().map(this::toDto).collect(Collectors.toList());
    }

    public BidResponse placeBid(BidRequest request) {
        auctionLock.lock();
        try {
            AuctionSession auction = auctionSessionRepository.findByIdForUpdate(request.getAuctionId())
                    .orElseThrow(() -> new IllegalArgumentException("Phiên đấu giá không tồn tại"));

            LocalDateTime now = LocalDateTime.now();
            if (auction.getStatus() != AuctionStatus.ACTIVE || auction.getEndTime() == null || !now.isBefore(auction.getEndTime())) {
                auction.setStatus(AuctionStatus.ENDED);
                auctionSessionRepository.save(auction);
                return BidResponse.fail("Phiên đấu giá đã kết thúc");
            }

            long requiredMinBid = auction.getCurrentHighestBid() == null || auction.getCurrentHighestBid() <= 0
                    ? MIN_BID_INCREMENT
                    : auction.getCurrentHighestBid() + MIN_BID_INCREMENT;

            if (request.getBidAmount() == null || request.getBidAmount() < requiredMinBid) {
                return BidResponse.fail("Bạn cần đặt giá cao hơn");
            }

            Bid bid = new Bid();
            bid.setAuctionId(request.getAuctionId());
            bid.setUserId(request.getUserId());
            bid.setBidAmount(request.getBidAmount());
            bid.setBidTime(now);
            bidRepository.save(bid);

            auction.setCurrentHighestBid(request.getBidAmount());
            auction.setCurrentWinnerUserId(request.getUserId());
            auction.setEndTime(auction.getEndTime().plusSeconds(ANTI_SNIPER_EXTENSION_SECONDS));
            auctionSessionRepository.save(auction);

            return BidResponse.success(auction.getAuctionId(), request.getUserId(), request.getBidAmount(), auction.getCurrentHighestBid(), auction.getEndTime());
        } finally {
            auctionLock.unlock();
        }
    }

    public boolean canJoinRoom(AuctionSession auctionSession, boolean depositConfirmed, LocalDateTime depositConfirmedAt) {
        if (auctionSession == null || !depositConfirmed || depositConfirmedAt == null) {
            return false;
        }
        if (auctionSession.getStartTime() == null) {
            return false;
        }
        LocalDateTime deadline = auctionSession.getStartTime().minusMinutes(DEPOSIT_DEADLINE_BEFORE_START_MINUTES);
        return !depositConfirmedAt.isAfter(deadline);
    }

    public AuctionSession createDefaultAuctionSession(Long auctionId, Long productId, LocalDateTime startTime) {
        AuctionSession session = new AuctionSession();
        session.setAuctionId(auctionId);
        session.setProductId(productId);
        session.setStartTime(startTime);
        session.setEndTime(startTime.plusSeconds(INITIAL_AUCTION_DURATION_SECONDS));
        session.setCurrentHighestBid(0L);
        session.setStatus(AuctionStatus.UPCOMING);
        session.setCreatedAt(LocalDateTime.now());
        return session;
    }

    public void lockEndedAuctions() {
        for (AuctionSession auction : auctionSessionRepository.findOpenRooms()) {
            if (auction.getEndTime() != null && !LocalDateTime.now().isBefore(auction.getEndTime())) {
                auction.setStatus(AuctionStatus.ENDED);
                auctionSessionRepository.save(auction);
            }
        }
    }

    public long secondsRemaining(AuctionSession auctionSession) {
        if (auctionSession == null || auctionSession.getEndTime() == null) {
            return 0;
        }
        return Math.max(0, Duration.between(LocalDateTime.now(), auctionSession.getEndTime()).getSeconds());
    }

    private AuctionSessionDto toDto(AuctionSession auctionSession) {
        AuctionSessionDto dto = new AuctionSessionDto();
        dto.setAuctionId(auctionSession.getAuctionId());
        dto.setProductId(auctionSession.getProductId());
        dto.setStartTime(auctionSession.getStartTime());
        dto.setEndTime(auctionSession.getEndTime());
        dto.setCurrentHighestBid(auctionSession.getCurrentHighestBid());
        dto.setCurrentWinnerUserId(auctionSession.getCurrentWinnerUserId());
        dto.setStatus(auctionSession.getStatus());
        return dto;
    }
}

