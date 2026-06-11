package com.auction.bidding.controller;

import com.auction.bidding.config.WebSocketConfig;
import com.auction.bidding.dto.AuctionSessionDto;
import com.auction.bidding.dto.BidRequest;
import com.auction.bidding.dto.BidResponse;
import com.auction.bidding.service.BiddingService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/bidding")
public class BiddingController {
    private final BiddingService biddingService;
    private final SimpMessagingTemplate messagingTemplate;

    public BiddingController(BiddingService biddingService, SimpMessagingTemplate messagingTemplate) {
        this.biddingService = biddingService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/rooms")
    public List<AuctionSessionDto> getAvailableRooms() {
        return biddingService.getOpenRooms();
    }

    @PostMapping("/bid")
    public BidResponse bid(@RequestBody BidRequest request) {
        BidResponse response = biddingService.placeBid(request);
        if (response.isSuccess()) {
            messagingTemplate.convertAndSend(WebSocketConfig.BID_TOPIC, response);
        }
        return response;
    }

    @MessageMapping("/bid")
    public BidResponse bidRealtime(BidRequest request) {
        BidResponse response = biddingService.placeBid(request);
        if (response.isSuccess()) {
            messagingTemplate.convertAndSend(WebSocketConfig.BID_TOPIC, response);
        }
        return response;
    }
}

