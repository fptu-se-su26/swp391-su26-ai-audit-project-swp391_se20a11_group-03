package com.auction.bidding.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.bidding.dto.AutoBidRequest;
import com.auction.bidding.dto.AutoBidResponse;
import com.auction.bidding.service.AutoBidService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bidding/auto")
@RequiredArgsConstructor
public class AutoBidController {

    private final AutoBidService autoBidService;

    @PostMapping("/{auctionId}")
    @PreAuthorize("hasAnyRole('User','Seller')")
    public AutoBidResponse setAutoBid(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long auctionId,
            @Valid @RequestBody AutoBidRequest request
    ) {
        return autoBidService.setAutoBid(auctionId, user.getId(), request.maxBidAmount());
    }

    @DeleteMapping("/{auctionId}")
    @PreAuthorize("hasAnyRole('User','Seller')")
    public AutoBidResponse cancelAutoBid(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long auctionId
    ) {
        return autoBidService.cancelAutoBid(auctionId, user.getId());
    }

    @GetMapping("/{auctionId}")
    @PreAuthorize("hasAnyRole('User','Seller')")
    public AutoBidResponse getMyAutoBid(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long auctionId
    ) {
        return autoBidService.getMyAutoBid(auctionId, user.getId());
    }
}
