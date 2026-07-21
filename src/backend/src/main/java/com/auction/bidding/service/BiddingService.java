package com.auction.bidding.service;

import com.auction.bidding.dto.AuctionSessionDto;
import com.auction.bidding.dto.BidRequest;
import com.auction.bidding.dto.BidResponse;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionDeposit;
import com.auction.bidding.entity.AuctionMode;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.AuctionStatus;
import com.auction.bidding.entity.Bid;
import com.auction.product.entity.Product;
import com.auction.product.entity.ProductImage;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.repository.BidRepository;
import com.auction.bidding.util.AuctionPhaseUtil;
import com.auction.bidding.util.AuctionTimingPolicy;
import com.auction.bidding.util.StepCalculator;
import com.auction.product.repository.ProductImageRepository;
import com.auction.product.repository.ProductRepository;
import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.fraud.event.BidCreatedEvent;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;

@Service
public class BiddingService {
    /** Minimum bid increment (VND). */
    public static final long MIN_BID_INCREMENT = 50_000L;
    public static final long INITIAL_AUCTION_DURATION_SECONDS = AuctionTimingPolicy.LIVE_DURATION.toSeconds();
    public static final long LIVE_BID_EXTENSION_SECONDS = AuctionTimingPolicy.LIVE_BID_EXTENSION.toSeconds();
    public static final long DEPOSIT_DEADLINE_BEFORE_START_MINUTES = AuctionTimingPolicy.DEPOSIT_CUTOFF.toMinutes();

    private final AuctionSessionRepository auctionSessionRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final AuctionDepositRepository auctionDepositRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ReentrantLock auctionLock = new ReentrantLock(true);

    public BiddingService(
            AuctionSessionRepository auctionSessionRepository,
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            ProductRepository productRepository,
            ProductImageRepository productImageRepository,
            AuctionDepositRepository auctionDepositRepository,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.auctionSessionRepository = auctionSessionRepository;
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.auctionDepositRepository = auctionDepositRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<AuctionSessionDto> getOpenRooms() {
        return auctionSessionRepository.findOpenRooms().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public BidResponse placeBid(BidRequest request) {
        auctionLock.lock();
        try {
            AuctionSession auction = auctionSessionRepository.findByIdForUpdate(request.getAuctionId())
                    .orElseThrow(() -> new IllegalArgumentException("Phiên đấu giá không tồn tại"));

            Product biddingProduct = productRepository.findById(auction.getProductId()).orElse(null);
            if (biddingProduct != null
                    && biddingProduct.getSellerId() != null
                    && biddingProduct.getSellerId().equals(request.getUserId())) {
                return BidResponse.fail("Người bán không thể tự đặt giá cho sản phẩm của mình");
            }

            User bidder = userRepository.findById(Math.toIntExact(request.getUserId())).orElse(null);
            if (bidder == null) {
                return BidResponse.fail("Bidder account does not exist");
            }
            String bidderStatusError = validateBidderStatus(bidder);
            if (bidderStatusError != null) {
                return BidResponse.fail(bidderStatusError);
            }

            boolean timedMode = auction.getAuctionMode() == AuctionMode.TIMED;

            AuctionDeposit bidderDeposit = auctionDepositRepository
                    .findByAuction_AuctionIdAndUser_Id(
                            request.getAuctionId(), Math.toIntExact(request.getUserId()))
                    .orElse(null);
            if (bidderDeposit == null || !"LOCKED".equalsIgnoreCase(bidderDeposit.getStatus())) {
                return BidResponse.fail("Bạn phải đặt cọc hợp lệ trước khi tham gia đấu giá");
            }

            LocalDateTime now = LocalDateTime.now();
            // Bidding is only allowed inside the [startTime, endTime) window.
            if (auction.getStartTime() == null || auction.getEndTime() == null
                    || now.isBefore(auction.getStartTime())
                    || !now.isBefore(auction.getEndTime())) {
                if (auction.getEndTime() != null && !now.isBefore(auction.getEndTime())) {
                    auction.setStatus(AuctionStatus.ENDED);
                    auctionSessionRepository.save(auction);
                    syncLegacyAuctionStatus(auction.getAuctionId(), "ENDED");
                }
                if (now.isBefore(auction.getStartTime())) {
                    return BidResponse.fail("Phiên đấu giá chưa bắt đầu (bắt đầu lúc " + auction.getStartTime() + ")");
                }
                return BidResponse.fail("Phiên đấu giá đã kết thúc");
            }

            // Bid grid is anchored to the product's starting price and the
            // value-based step: valid bids are startingPrice + k*step (k >= 1).
            long startingPrice = biddingProduct != null && biddingProduct.getStartingPrice() != null
                    ? biddingProduct.getStartingPrice()
                    : 0L;
            long current = auction.getCurrentHighestBid() == null ? 0L : auction.getCurrentHighestBid();
            boolean hasPriorBids = auction.getCurrentWinnerUserId() != null;

            Long bidAmount = request.getBidAmount();
            if (timedMode) {
                // Open English auction: each bid must top the current price by 5%.
                long requiredMinBid = StepCalculator.computeTimedMinNextBid(startingPrice, current, hasPriorBids);
                if (bidAmount == null || bidAmount < requiredMinBid) {
                    return BidResponse.fail("Giá đặt tối thiểu là " + String.format("%,d", requiredMinBid)
                            + " VND (giá hiện tại + bước giá 5%)");
                }
            } else {
                long step = StepCalculator.calculate(startingPrice);
                long requiredMinBid = StepCalculator.computeMinNextBid(startingPrice, current, step);
                if (bidAmount == null || bidAmount < requiredMinBid) {
                    return BidResponse.fail("Giá đặt tối thiểu là " + requiredMinBid + " VND");
                }
                if (!StepCalculator.isOnBidGrid(startingPrice, bidAmount, step)) {
                    return BidResponse.fail("Giá đặt phải bằng giá khởi điểm cộng bội số của bước giá ("
                            + step + " VND)");
                }
            }

            Bid bid = new Bid();
            bid.setAuctionId(request.getAuctionId());
            bid.setUserId(request.getUserId());
            bid.setBidAmount(request.getBidAmount());
            bid.setBidTime(now);
            bid.setIpAddress(request.getIpAddress());
            bid.setDeviceHash(request.getDeviceHash());
            Bid savedBid = bidRepository.save(bid);

            auction.setCurrentHighestBid(request.getBidAmount());
            auction.setCurrentWinnerUserId(request.getUserId());
            // The first valid bid moves the row to ACTIVE. We set status on the
            // SAME entity (AuctionSession) instead of loading/saving the legacy
            // Auction entity, which maps the same table and would otherwise clobber
            // the bid amount / winner we just set.
            auction.setStatus(AuctionStatus.ACTIVE);

            // A successful LIVE bid extends the authoritative end time by exactly
            // ten seconds. The row is pessimistically locked, so concurrent bids
            // apply their extensions serially and no extension is lost.
            if (auction.getAuctionMode() == AuctionMode.LIVE) {
                auction.setEndTime(AuctionTimingPolicy.extendLiveEnd(auction.getEndTime()));
            }

            auctionSessionRepository.save(auction);

            if (savedBid != null && savedBid.getBidId() != null) {
                eventPublisher.publishEvent(new BidCreatedEvent(savedBid.getBidId()));
            }

            return BidResponse.success(auction.getAuctionId(), request.getUserId(), request.getBidAmount(), auction.getCurrentHighestBid(), auction.getEndTime());
        } finally {
            auctionLock.unlock();
        }
    }

    private String validateBidderStatus(User bidder) {
        String status = bidder.getStatus();
        if (!bidder.isActive() || "BANNED".equalsIgnoreCase(status)) {
            return "Account is banned or inactive";
        }
        if ("TEMPORARILY_SUSPENDED".equalsIgnoreCase(status)) {
            return "Account is temporarily suspended";
        }
        if ("BID_RESTRICTED".equalsIgnoreCase(status)) {
            if (bidder.getBidRestrictedUntil() != null
                    && bidder.getBidRestrictedUntil().isAfter(LocalDateTime.now())) {
                return "Bidding is restricted until " + bidder.getBidRestrictedUntil();
            }
            bidder.setStatus("ACTIVE");
            bidder.setBidRestrictedUntil(null);
            bidder.setSuspensionReason(null);
            userRepository.save(bidder);
        }
        return null;
    }

    /**
     * Mirror the lifecycle status onto the legacy {@link Auction} row that
     * {@code BiddingProductServiceImpl} exposes to the storefront. The two
     * entities share the same primary key, so we just look up the legacy row
     * by id and overwrite its status string.
     */
    @Transactional
    protected void syncLegacyAuctionStatus(Long auctionId, String newStatus) {
        if (auctionId == null || newStatus == null) {
            return;
        }
        auctionRepository.findById(auctionId).ifPresent(legacy -> {
            if (!newStatus.equalsIgnoreCase(legacy.getStatus())) {
                legacy.setStatus(newStatus);
                auctionRepository.save(legacy);
            }
        });
    }

    public boolean canJoinRoom(AuctionSession auctionSession, boolean depositConfirmed, LocalDateTime depositConfirmedAt) {
        if (auctionSession == null || !depositConfirmed || depositConfirmedAt == null) {
            return false;
        }
        if (auctionSession.getStartTime() == null) {
            return false;
        }
        LocalDateTime deadline = AuctionTimingPolicy.depositDeadline(auctionSession.getStartTime());
        return depositConfirmedAt.isBefore(deadline);
    }

    public AuctionSession createDefaultAuctionSession(Long auctionId, Long productId, LocalDateTime startTime) {
        AuctionSession session = new AuctionSession();
        session.setAuctionId(auctionId);
        session.setProductId(productId);
        session.setStartTime(startTime);
        session.setEndTime(AuctionTimingPolicy.liveEndAt(startTime));
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
                syncLegacyAuctionStatus(auction.getAuctionId(), "ENDED");
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

    public List<Map<String, Object>> getUserBids(Integer userId) {
        Map<Long, Map<String, Object>> resultByAuction = new LinkedHashMap<>();

        // 1) Auctions where the user has actually placed bids (keep highest bid per auction)
        for (Bid bid : bidRepository.findByUserId(userId)) {
            AuctionSession auction = auctionSessionRepository.findById(bid.getAuctionId()).orElse(null);
            if (auction == null) continue;
            Long auctionId = auction.getAuctionId();
            if (resultByAuction.containsKey(auctionId)) {
                @SuppressWarnings("unchecked")
                Map<String, Object> existing = resultByAuction.get(auctionId);
                Long existingUserBid = (Long) existing.get("userHighestBid");
                if (existingUserBid != null && bid.getBidAmount() <= existingUserBid) {
                    continue;
                }
            }
            Long marketPrice = auction.getCurrentHighestBid() != null && auction.getCurrentHighestBid() > 0
                    ? auction.getCurrentHighestBid()
                    : bid.getBidAmount();
            Map<String, Object> map = buildBidMap(auction, userId, bid.getBidId(), marketPrice, bid.getBidAmount());
            resultByAuction.put(auctionId, map);
        }

        // 2) Auctions where the user has only deposited (no bid yet), including ended sessions
        for (AuctionDeposit deposit : auctionDepositRepository.findByUser_Id(userId)) {
            if (deposit.getAuction() == null) continue;
            Long auctionId = deposit.getAuction().getAuctionId();
            if (resultByAuction.containsKey(auctionId)) continue;
            AuctionSession auction = auctionSessionRepository.findById(auctionId).orElse(null);
            if (auction == null) continue;
            Product product = productRepository.findById(auction.getProductId()).orElse(null);
            Long currentBidAmount = auction.getCurrentHighestBid() != null && auction.getCurrentHighestBid() > 0
                    ? auction.getCurrentHighestBid()
                    : (product != null ? product.getStartingPrice() : 0L);
            Map<String, Object> map = buildBidMap(auction, userId, null, currentBidAmount, null);
            if (isAuctionEnded(auction)) {
                map.put("status", resolveBidStatus(auction, userId));
            } else {
                map.put("status", "deposited");
            }
            resultByAuction.put(auctionId, map);
        }

        return new ArrayList<>(resultByAuction.values());
    }

    private Map<String, Object> buildBidMap(AuctionSession auction, Integer userId, Long bidId, Long currentBidAmount, Long userHighestBid) {
        Map<String, Object> map = new HashMap<>();
        Product product = productRepository.findById(auction.getProductId()).orElse(null);

        map.put("bidId", bidId != null ? bidId : auction.getAuctionId());
        map.put("auctionId", auction.getAuctionId());
        map.put("productId", product != null ? product.getProductId() : auction.getProductId());
        map.put("productName", product != null ? product.getProductName() : "Unknown");
        map.put("lotNumber", "LOT-" + (product != null ? product.getProductId() : auction.getAuctionId()));
        map.put("image", product != null ? getPrimaryImageUrl(product.getProductId()) : null);
        long startingPrice = product != null && product.getStartingPrice() != null
                ? product.getStartingPrice()
                : 0L;
        boolean timedBlind = AuctionPhaseUtil.isTimedBlindBiddingOpen(auction);
        map.put("auctionMode", auction.getAuctionMode() != null ? auction.getAuctionMode().name() : "TIMED");
        map.put("priceHidden", timedBlind);
        map.put("currentBid", timedBlind ? startingPrice : currentBidAmount);
        map.put("userHighestBid", timedBlind ? null : userHighestBid);
        map.put("startingPrice", startingPrice);
        map.put("paymentStatus", auction.getPaymentStatus());
        if (auction.getPaymentDeadline() != null) {
            map.put("paymentDeadline", auction.getPaymentDeadline().toString());
        }

        boolean ended = isAuctionEnded(auction);
        if (auction.getEndTime() != null) {
            long seconds = Duration.between(LocalDateTime.now(), auction.getEndTime()).getSeconds();
            if (seconds > 0 && !ended) {
                map.put("timeLeft", formatDuration(seconds));
            } else {
                map.put("timeLeft", "Ended");
            }
            map.put("auctionEndTime", auction.getEndTime().toString());
            if (bidId == null && !ended) {
                map.put("status", "deposited");
            } else {
                map.put("status", resolveBidStatus(auction, userId));
            }
        } else {
            map.put("timeLeft", "Unknown");
            map.put("status", bidId == null ? "deposited" : "outbid");
        }

        return map;
    }

    private boolean isAuctionEnded(AuctionSession auction) {
        if (auction.getStatus() == AuctionStatus.ENDED
                || auction.getStatus() == AuctionStatus.AWAITING_PAYMENT
                || auction.getStatus() == AuctionStatus.PAID
                || auction.getStatus() == AuctionStatus.FORFEITED) {
            return true;
        }
        return auction.getEndTime() != null && !LocalDateTime.now().isBefore(auction.getEndTime());
    }

    public List<Map<String, Object>> getWonItems(Integer userId) {
        List<AuctionSession> wonAuctions = auctionSessionRepository.findByCurrentWinnerUserId(userId);

        return wonAuctions.stream().filter(this::isAuctionEnded).map(auction -> {
            Map<String, Object> map = new HashMap<>();
            Product product = productRepository.findById(auction.getProductId()).orElse(null);
            map.put("id", auction.getAuctionId());
            map.put("auctionId", auction.getAuctionId());
            map.put("productId", auction.getProductId());
            map.put("productName", product != null ? product.getProductName() : "Auction #" + auction.getAuctionId());
            map.put("lotNumber", "LOT-" + auction.getProductId());
            map.put("image", getPrimaryImageUrl(auction.getProductId()));
            map.put("finalPrice", auction.getCurrentHighestBid());
            map.put("wonDate", auction.getEndTime() != null ? auction.getEndTime().toString() : LocalDateTime.now().toString());
            String paymentStatus = auction.getPaymentStatus();
            map.put("paymentStatus", paymentStatus);
            if (auction.getPaymentDeadline() != null) {
                map.put("paymentDeadline", auction.getPaymentDeadline().toString());
            }
            boolean overdue = auction.getPaymentDeadline() != null
                    && auction.getPaymentDeadline().isBefore(LocalDateTime.now());
            if ("PAID".equalsIgnoreCase(paymentStatus)) {
                map.put("status", "paid");
            } else if ("FORFEITED".equalsIgnoreCase(paymentStatus) || overdue) {
                map.put("status", "forfeited");
            } else {
                map.put("status", "pending_payment");
            }
            return map;
        }).collect(Collectors.toList());
    }

    private String getPrimaryImageUrl(Long productId) {
        return productImageRepository.findByProductId(productId).stream()
                .sorted(Comparator.comparing((ProductImage image) -> !Boolean.TRUE.equals(image.getIsPrimary())))
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(null);
    }

    private String resolveBidStatus(AuctionSession auction, Integer userId) {
        if (isAuctionEnded(auction)) {
            return auction.getCurrentWinnerUserId() != null && auction.getCurrentWinnerUserId().equals(userId.longValue())
                    ? "won"
                    : "lost";
        }
        if (AuctionPhaseUtil.isTimedBlindBiddingOpen(auction)) {
            return "sealed";
        }
        return auction.getCurrentWinnerUserId() != null && auction.getCurrentWinnerUserId().equals(userId.longValue())
                ? "leading"
                : "outbid";
    }

    private String formatDuration(long seconds) {
        if (seconds < 60) {
            return seconds + "s";
        } else if (seconds < 3600) {
            return (seconds / 60) + "m";
        } else if (seconds < 86400) {
            return (seconds / 3600) + "h";
        } else {
            return (seconds / 86400) + "d";
        }
    }
}

