package com.hoangxuananhtuan.auction.controller;

import com.hoangxuananhtuan.auction.dto.AuctionEligibilityResponse;
import com.hoangxuananhtuan.auction.service.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auctions")
@RequiredArgsConstructor
public class AuctionController {

    private final AuctionService auctionService;

    @GetMapping("/{auctionId}/eligibility")
    public ResponseEntity<AuctionEligibilityResponse> getEligibility(
            @PathVariable Long auctionId,
            @RequestParam(required = false) Long userId
    ) {
        return ResponseEntity.ok(auctionService.getEligibility(auctionId, userId));
    }
}
