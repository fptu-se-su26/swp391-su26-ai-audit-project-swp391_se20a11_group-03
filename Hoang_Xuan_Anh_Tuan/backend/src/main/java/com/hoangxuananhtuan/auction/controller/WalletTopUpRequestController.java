package com.hoangxuananhtuan.auction.controller;

import com.hoangxuananhtuan.auction.dto.WalletTopUpRequestCreateRequest;
import com.hoangxuananhtuan.auction.dto.WalletTopUpRequestResponse;
import com.hoangxuananhtuan.auction.service.WalletTopUpRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topups")
@RequiredArgsConstructor
public class WalletTopUpRequestController {

    private final WalletTopUpRequestService topUpRequestService;

    @PostMapping
    public ResponseEntity<WalletTopUpRequestResponse> create(@RequestBody WalletTopUpRequestCreateRequest request) {
        return ResponseEntity.ok(topUpRequestService.createTopUpRequest(request));
    }

    @GetMapping("/my/{userId}")
    public ResponseEntity<List<WalletTopUpRequestResponse>> myRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(topUpRequestService.getMyTopUpRequests(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<WalletTopUpRequestResponse>> pending() {
        return ResponseEntity.ok(topUpRequestService.getPendingTopUpRequests());
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<WalletTopUpRequestResponse> approve(@PathVariable Long requestId, @RequestParam Long reviewerId) {
        return ResponseEntity.ok(topUpRequestService.approveTopUpRequest(requestId, reviewerId));
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<WalletTopUpRequestResponse> reject(@PathVariable Long requestId, @RequestParam Long reviewerId) {
        return ResponseEntity.ok(topUpRequestService.rejectTopUpRequest(requestId, reviewerId));
    }
}
