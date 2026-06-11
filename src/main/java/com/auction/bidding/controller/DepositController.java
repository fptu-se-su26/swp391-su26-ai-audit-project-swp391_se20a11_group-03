package com.auction.bidding.controller;

import com.auction.bidding.dto.DepositResponse;
import com.auction.bidding.service.DepositService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deposits")
@RequiredArgsConstructor
public class DepositController {

    private final DepositService depositService;

    @PostMapping
    public ResponseEntity<DepositResponse> createDeposit(
            @RequestParam Long auctionId,
            @RequestParam Long userId
    ) {
        return ResponseEntity.ok(depositService.createDeposit(auctionId, userId));
    }
}

