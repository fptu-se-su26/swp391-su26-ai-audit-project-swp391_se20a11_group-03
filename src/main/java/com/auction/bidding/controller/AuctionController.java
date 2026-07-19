package com.auction.bidding.controller;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.account.security.UserDetailsImpl;
import com.auction.bidding.config.WebSocketConfig;
import com.auction.bidding.dto.AuctionEligibilityResponse;
import com.auction.bidding.dto.AuctionStateResponse;
import com.auction.bidding.dto.BidRecordResponse;
import com.auction.bidding.dto.BidRequest;
import com.auction.bidding.dto.BidResponse;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.Bid;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.BidRepository;
import com.auction.bidding.service.AuctionService;
import com.auction.bidding.service.AuctionPaymentService;
import com.auction.bidding.service.BiddingService;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.AuctionStatus;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.common.util.KycGuard;
import com.auction.bidding.util.StepCalculator;
import com.auction.bidding.util.AuctionPhaseUtil;
import com.auction.product.entity.Contract;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import com.auction.product.service.ContractPdfAccessService;
import com.auction.product.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;
    private final BiddingService biddingService;
    private final AuctionRepository auctionRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final BidRepository bidRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuctionPaymentService auctionPaymentService;
    private final ContractService contractService;
    private final ContractPdfAccessService contractPdfAccessService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/{auctionId}/eligibility")
    public ResponseEntity<AuctionEligibilityResponse> getEligibility(
            @PathVariable("auctionId") Long auctionId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        Long userId = user != null ? user.getId() : null;
        return ResponseEntity.ok(auctionService.getEligibility(auctionId, userId));
    }

    /** Polled by the frontend every 1s. Public so unauthenticated users can preview the room. */
    @GetMapping("/{auctionId}/state")
    public ResponseEntity<AuctionStateResponse> getState(@PathVariable("auctionId") Long auctionId) {
        biddingService.lockEndedAuctions();

        AuctionSession auction = auctionSessionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        Product product = productRepository.findById(auction.getProductId()).orElse(null);

        long totalBids = bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId).size();
        long startingPrice = product != null && product.getStartingPrice() != null
                ? product.getStartingPrice()
                : 0L;
        long currentHighestBid = auction.getCurrentHighestBid() != null
                ? auction.getCurrentHighestBid()
                : startingPrice;
        long bidStep = StepCalculator.calculate(startingPrice);
        long minNextBid = StepCalculator.computeMinNextBid(startingPrice, currentHighestBid, bidStep);

        boolean timedBlind = AuctionPhaseUtil.isTimedBlindBiddingOpen(auction);
        if (timedBlind) {
            currentHighestBid = startingPrice;
            bidStep = 0L;
            minNextBid = startingPrice;
        }

        String effectiveStatus = resolveEffectiveStatus(auction);
        String winnerUsername = null;
        Long winnerUserId = timedBlind ? null : auction.getCurrentWinnerUserId();
        if (!timedBlind && auction.getCurrentWinnerUserId() != null) {
            winnerUsername = userRepository.findById(Math.toIntExact(auction.getCurrentWinnerUserId()))
                    .map(User::getUsername)
                    .orElse(null);
        }

        AuctionStateResponse.AuctionStateResponseBuilder b = AuctionStateResponse.builder()
                .auctionId(auction.getAuctionId())
                .productId(auction.getProductId())
                .auctionMode(auction.getAuctionMode() != null ? auction.getAuctionMode().name() : "TIMED")
                .status(effectiveStatus)
                .paymentStatus(auction.getPaymentStatus())
                .startingPrice(startingPrice)
                .bidStep(bidStep)
                .minNextBid(minNextBid)
                .currentHighestBid(currentHighestBid)
                .currentWinnerUserId(winnerUserId)
                .winnerUsername(winnerUsername)
                .priceHidden(timedBlind)
                .bidsAnonymous(timedBlind)
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .paymentDeadline(auction.getPaymentDeadline())
                .totalBids(totalBids)
                .serverNow(LocalDateTime.now());

        return ResponseEntity.ok(b.build());
    }

    private String resolveEffectiveStatus(AuctionSession auction) {
        LocalDateTime now = LocalDateTime.now();
        if (auction.getEndTime() != null && !now.isBefore(auction.getEndTime())) {
            return AuctionStatus.ENDED.name();
        }
        if (auction.getStartTime() != null && now.isBefore(auction.getStartTime())) {
            return AuctionStatus.UPCOMING.name();
        }
        if (auction.getStatus() == AuctionStatus.ACTIVE) {
            return AuctionStatus.ACTIVE.name();
        }
        if (auction.getStatus() != null) {
            return auction.getStatus().name();
        }
        return AuctionStatus.ACTIVE.name();
    }

    /** Public: latest bids for an auction, sorted newest first. */
    @GetMapping("/{auctionId}/bids")
    public ResponseEntity<List<BidRecordResponse>> getBidHistory(
            @PathVariable("auctionId") Long auctionId,
            @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        AuctionSession auction = auctionSessionRepository.findById(auctionId).orElse(null);
        if (auction != null && AuctionPhaseUtil.isTimedBlindBiddingOpen(auction)) {
            return ResponseEntity.ok(List.of());
        }

        List<Bid> bids = bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId);
        Map<Integer, String> usernameByUserId = userRepository.findAll().stream()
                .filter(u -> u.getUsername() != null)
                .collect(Collectors.toMap(User::getId, User::getUsername, (a, b) -> a));

        List<BidRecordResponse> result = bids.stream()
                .sorted(Comparator.comparing(Bid::getBidTime).reversed())
                .limit(Math.max(1, Math.min(limit, 100)))
                .map(b -> BidRecordResponse.builder()
                        .bidId(b.getBidId())
                        .auctionId(b.getAuctionId())
                        .userId(b.getUserId())
                        .username(usernameByUserId.get(Math.toIntExact(b.getUserId())))
                        .bidAmount(b.getBidAmount())
                        .bidTime(b.getBidTime())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /** Place a bid. Authenticated + KYC-verified user only. */
    @PostMapping("/{auctionId}/bid")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<BidResponse> placeBid(
            @PathVariable("auctionId") Long auctionId,
            @RequestBody BidRequest request,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body(BidResponse.fail("Authentication required"));
        }
        try {
            KycGuard.requireVerified(Math.toIntExact(user.getId()), userRepository);
        } catch (com.auction.common.exception.KycRequiredException ex) {
            return ResponseEntity.status(403).body(BidResponse.fail(ex.getMessage()));
        }
        request.setAuctionId(auctionId);
        request.setUserId(user.getId());
        BidResponse response = biddingService.placeBid(request);
        if (response.isSuccess()) {
            AuctionSession session = auctionSessionRepository.findById(auctionId).orElse(null);
            if (session == null || !AuctionPhaseUtil.isTimedBlindBiddingOpen(session)) {
                messagingTemplate.convertAndSend(WebSocketConfig.BID_TOPIC, response);
            } else {
                messagingTemplate.convertAndSend(WebSocketConfig.BID_TOPIC,
                        BidResponse.successTimedBlind(auctionId, response.getEndTime()));
            }
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{auctionId}/pay")
    public ResponseEntity<?> payAuction(
            @PathVariable("auctionId") Long auctionId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Authentication required"
            ));
        }
        try {
            return ResponseEntity.ok(auctionPaymentService.payAuction(auctionId, user.getId()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
            ));
        }
    }

    /** Returns purchase contract status and metadata (winner only). */
    @GetMapping("/{auctionId}/purchase-contract")
    public ResponseEntity<?> getPurchaseContract(
            @PathVariable("auctionId") Long auctionId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Authentication required"));
        }
        try {
            return ResponseEntity.ok(contractService.getPurchaseContractPreview(auctionId, user.getId()));
        } catch (com.auction.common.exception.BusinessException ex) {
            return ResponseEntity.status(403).body(Map.of("success", false, "message", ex.getMessage()));
        }
    }

    /** Alias kept for compatibility; prefer GET /purchase-contract. */
    @GetMapping("/{auctionId}/purchase-contract/preview")
    public ResponseEntity<?> getPurchaseContractPreview(
            @PathVariable("auctionId") Long auctionId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        return getPurchaseContract(auctionId, user);
    }

    @GetMapping(value = "/{auctionId}/purchase-contract/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getPurchaseContractPdf(
            @PathVariable("auctionId") Long auctionId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        try {
            contractService.getPurchaseContractPreview(auctionId, user.getId());
        } catch (com.auction.common.exception.BusinessException ex) {
            return ResponseEntity.status(403).build();
        }
        Contract contract = contractService.getPurchaseContract(auctionId);
        if (contract == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] pdf = contractPdfAccessService.resolvePdfBytes(contract.getContractId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"purchase-agreement-" + auctionId + ".pdf\"")
                .body(pdf);
    }

    /** Winner signs the purchase agreement (required before payment). */
    @PostMapping("/{auctionId}/purchase-contract/sign")
    public ResponseEntity<?> signPurchaseContract(
            @PathVariable("auctionId") Long auctionId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Authentication required"));
        }
        try {
            contractService.acknowledgePurchaseContract(auctionId, user.getId());
            boolean persisted = contractService.hasPurchaseContract(auctionId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", persisted
                            ? "Đã ký hợp đồng mua bán. Bạn có thể tiếp tục thanh toán."
                            : "Đã xác nhận hợp đồng. Hợp đồng sẽ được lưu khi thanh toán thành công.",
                    "signed", persisted,
                    "acknowledged", true
            ));
        } catch (com.auction.common.exception.BusinessException ex) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", ex.getMessage()));
        }
    }
}
