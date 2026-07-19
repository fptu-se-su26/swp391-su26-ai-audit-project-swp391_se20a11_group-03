package com.auction.bidding.controller;

import com.auction.bidding.config.WebSocketConfig;
import com.auction.bidding.dto.AuctionSessionDto;
import com.auction.bidding.dto.BidRequest;
import com.auction.bidding.dto.BidResponse;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.service.BiddingService;
import com.auction.bidding.util.AuctionPhaseUtil;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.dao.UserRepository;
import java.security.Principal;

import java.util.List;

@RestController
@RequestMapping("/api/bidding")
public class BiddingController {
    private final BiddingService biddingService;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionSessionRepository auctionSessionRepository;
    private final UserRepository userRepository;

    public BiddingController(
            BiddingService biddingService,
            SimpMessagingTemplate messagingTemplate,
            AuctionSessionRepository auctionSessionRepository,
            UserRepository userRepository
    ) {
        this.biddingService = biddingService;
        this.messagingTemplate = messagingTemplate;
        this.auctionSessionRepository = auctionSessionRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/rooms")
    public List<AuctionSessionDto> getAvailableRooms() {
        return biddingService.getOpenRooms();
    }

    @PostMapping("/bid")
    @PreAuthorize("isAuthenticated()")
    public BidResponse bid(@RequestBody BidRequest request, @AuthenticationPrincipal UserDetailsImpl user) {
        request.setUserId(user.getId()); // Never trust a client-supplied buyer id.
        BidResponse response = biddingService.placeBid(request);
        broadcastBid(response);
        return response;
    }

    @MessageMapping("/bid")
    @PreAuthorize("isAuthenticated()")
    public BidResponse bidRealtime(BidRequest request, Principal principal) {
        Long authenticatedId = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Authenticated user not found"))
                .getUserId();
        request.setUserId(authenticatedId); // Prevent WebSocket payload identity spoofing.
        BidResponse response = biddingService.placeBid(request);
        broadcastBid(response);
        return response;
    }

    private void broadcastBid(BidResponse response) {
        if (!response.isSuccess()) {
            return;
        }
        AuctionSession session = auctionSessionRepository.findById(response.getAuctionId()).orElse(null);
        if (session == null || !AuctionPhaseUtil.isTimedBlindBiddingOpen(session)) {
            messagingTemplate.convertAndSend(WebSocketConfig.BID_TOPIC, response);
        } else {
            messagingTemplate.convertAndSend(WebSocketConfig.BID_TOPIC,
                    BidResponse.successTimedBlind(response.getAuctionId(), response.getEndTime()));
        }
    }
}
