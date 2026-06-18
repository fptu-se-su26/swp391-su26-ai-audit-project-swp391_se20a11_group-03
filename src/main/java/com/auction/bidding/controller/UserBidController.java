package com.auction.bidding.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.bidding.dto.BidResponse;
import com.auction.bidding.service.BiddingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bids")
public class UserBidController {
    
    private final BiddingService biddingService;

    public UserBidController(BiddingService biddingService) {
        this.biddingService = biddingService;
    }

    @GetMapping("/my-bids")
    public ResponseEntity<?> getMyBids(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Please login to view your bids"
            ));
        }

        try {
            List<?> bids = biddingService.getUserBids(Math.toIntExact(currentUser.getId()));
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", bids
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of() // Return empty list if no data
            ));
        }
    }

    @GetMapping("/won")
    public ResponseEntity<?> getWonItems(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                "success", false,
                "message", "Please login to view your won items"
            ));
        }

        try {
            List<?> wonItems = biddingService.getWonItems(Math.toIntExact(currentUser.getId()));
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", wonItems
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", List.of()
            ));
        }
    }
}
