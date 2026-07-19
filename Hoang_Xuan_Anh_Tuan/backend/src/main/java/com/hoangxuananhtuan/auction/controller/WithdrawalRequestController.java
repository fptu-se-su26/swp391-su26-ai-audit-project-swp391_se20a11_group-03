package com.hoangxuananhtuan.auction.controller;

import com.hoangxuananhtuan.auction.dto.WithdrawalRequestCreateRequest;
import com.hoangxuananhtuan.auction.dto.WithdrawalRequestResponse;
import com.hoangxuananhtuan.auction.service.WithdrawalRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/withdrawals")
@RequiredArgsConstructor
public class WithdrawalRequestController {

    private final WithdrawalRequestService withdrawalRequestService;

    @PostMapping
    public ResponseEntity<WithdrawalRequestResponse> create(@RequestBody WithdrawalRequestCreateRequest request) {
        return ResponseEntity.ok(withdrawalRequestService.createWithdrawalRequest(request));
    }

    @GetMapping("/my/{userId}")
    public ResponseEntity<List<WithdrawalRequestResponse>> myRequests(@PathVariable Long userId) {
        return ResponseEntity.ok(withdrawalRequestService.getMyWithdrawalRequests(userId));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<WithdrawalRequestResponse>> pending() {
        return ResponseEntity.ok(withdrawalRequestService.getPendingWithdrawalRequests());
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<WithdrawalRequestResponse> approve(
            @PathVariable Long requestId,
            @RequestParam Long reviewerId
    ) {
        return ResponseEntity.ok(withdrawalRequestService.approveWithdrawalRequest(requestId, reviewerId));
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<WithdrawalRequestResponse> reject(
            @PathVariable Long requestId,
            @RequestParam Long reviewerId
    ) {
        return ResponseEntity.ok(withdrawalRequestService.rejectWithdrawalRequest(requestId, reviewerId));
    }
}
