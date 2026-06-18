package com.auction.bidding.controller;

import com.auction.account.dao.UserRepository;
import com.auction.account.security.UserDetailsImpl;
import com.auction.bidding.dto.DepositResponse;
import com.auction.bidding.service.DepositService;
import com.auction.common.exception.KycRequiredException;
import com.auction.common.util.KycGuard;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deposits")
@RequiredArgsConstructor
public class DepositController {

    private final DepositService depositService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<DepositResponse> createDeposit(
            @RequestParam(name = "auctionId") Long auctionId,
            @AuthenticationPrincipal UserDetailsImpl user
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body(DepositResponse.builder()
                    .message("Authentication required").build());
        }
        try {
            KycGuard.requireVerified(Math.toIntExact(user.getId()), userRepository);
        } catch (KycRequiredException ex) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(DepositResponse.builder().message(ex.getMessage()).build());
        }
        return ResponseEntity.ok(depositService.createDeposit(auctionId, user.getId()));
    }
}
