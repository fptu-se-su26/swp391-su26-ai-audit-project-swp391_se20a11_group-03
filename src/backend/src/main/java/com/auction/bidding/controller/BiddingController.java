package com.auction.bidding.controller;

import com.auction.bidding.config.WebSocketConfig;
import com.auction.bidding.dto.AuctionSessionDto;
import com.auction.bidding.dto.BidRequest;
import com.auction.bidding.dto.BidResponse;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.service.BiddingService;
import com.auction.bidding.util.AuctionPhaseUtil;
import com.auction.account.security.UserDetailsImpl;
import com.auction.fraud.service.BidMetadataService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bidding")
public class BiddingController {
    private final BiddingService biddingService;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuctionSessionRepository auctionSessionRepository;
    private final BidMetadataService bidMetadataService;

    public BiddingController(
            BiddingService biddingService,
            SimpMessagingTemplate messagingTemplate,
            AuctionSessionRepository auctionSessionRepository,
            BidMetadataService bidMetadataService
    ) {
        this.biddingService = biddingService;
        this.messagingTemplate = messagingTemplate;
        this.auctionSessionRepository = auctionSessionRepository;
        this.bidMetadataService = bidMetadataService;
    }

    @GetMapping("/rooms")
    public List<AuctionSessionDto> getAvailableRooms() {
        return biddingService.getOpenRooms();
    }

    @PostMapping("/bid")
    public BidResponse bid(@RequestBody BidRequest request,
                           @AuthenticationPrincipal UserDetailsImpl user,
                           HttpServletRequest httpRequest) {
        if (user == null) return BidResponse.fail("Authentication required");
        request.setUserId(user.getId());
        request.setIpAddress(bidMetadataService.resolveIpAddress(httpRequest));
        request.setDeviceHash(bidMetadataService.resolveDeviceHash(httpRequest));
        BidResponse response = biddingService.placeBid(request);
        broadcastBid(response);
        return response;
    }

    @MessageMapping("/bid")
    public BidResponse bidRealtime(BidRequest request, Principal principal) {
        if (principal == null) return BidResponse.fail("Authentication required");
        try {
            request.setUserId(Long.parseLong(principal.getName()));
        } catch (NumberFormatException ex) {
            return BidResponse.fail("Invalid authenticated user");
        }
        request.setIpAddress(null);
        request.setDeviceHash(null);
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
