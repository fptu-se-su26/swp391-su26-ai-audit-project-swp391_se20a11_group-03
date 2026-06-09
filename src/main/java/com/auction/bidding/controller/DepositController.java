package com.hoangxuananhtuan.auction.controller;

import com.hoangxuananhtuan.auction.dto.DepositResponse;
import com.hoangxuananhtuan.auction.service.DepositService;
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

