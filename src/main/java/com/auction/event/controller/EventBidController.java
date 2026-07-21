package com.auction.event.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.event.dto.BidRequest;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.entity.SealedBid;
import com.auction.event.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/events/{eventId}/products/{eventProductId}")
@RequiredArgsConstructor
public class EventBidController {

    private final StandardEventBidService standardEventBidService;
    private final DutchAuctionService dutchAuctionService;
    private final SealedBidService sealedBidService;
    private final PennyAuctionService pennyAuctionService;

    // Standard bidding
    @PostMapping("/bid")
    @PreAuthorize("hasRole('USER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventProductResponse>> placeStandardBid(
            @PathVariable Long eventId,
            @PathVariable Long eventProductId,
            @RequestBody BidRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        EventProductResponse response = standardEventBidService.placeBid(eventProductId, userId, request.getBidAmount());
        return ResponseEntity.ok(ApiResponse.success("Đặt giá thành công", response));
    }

    // Dutch auction
    @GetMapping("/dutch/current-price")
    public ResponseEntity<ApiResponse<Long>> getDutchCurrentPrice(
            @PathVariable Long eventId,
            @PathVariable Long eventProductId
    ) {
        Long price = dutchAuctionService.getCurrentPrice(eventProductId);
        return ResponseEntity.ok(ApiResponse.success(price));
    }

    @PostMapping("/dutch/commit")
    @PreAuthorize("hasRole('USER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventProductResponse>> commitDutchPurchase(
            @PathVariable Long eventId,
            @PathVariable Long eventProductId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        EventProductResponse response = dutchAuctionService.commitPurchase(eventProductId, userId);
        return ResponseEntity.ok(ApiResponse.success("Mua thành công", response));
    }

    // Sealed bid
    @PostMapping("/sealed/bid")
    @PreAuthorize("hasRole('USER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SealedBid>> submitSealedBid(
            @PathVariable Long eventId,
            @PathVariable Long eventProductId,
            @RequestBody BidRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        SealedBid response = sealedBidService.submitBid(eventProductId, userId, request.getBidAmount());
        return ResponseEntity.ok(ApiResponse.success("Gửi giá kín thành công", response));
    }

    @GetMapping("/sealed/reveal-result")
    public ResponseEntity<ApiResponse<EventProductResponse>> getSealedRevealResult(
            @PathVariable Long eventId,
            @PathVariable Long eventProductId
    ) {
        Optional<EventProductResponse> result = sealedBidService.getRevealResult(eventProductId);
        if (result.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success(result.get()));
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Kết quả chưa được công bố"));
    }

    // Penny auction
    @PostMapping("/penny/bid")
    @PreAuthorize("hasRole('USER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventProductResponse>> placePennyBid(
            @PathVariable Long eventId,
            @PathVariable Long eventProductId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        EventProductResponse response = pennyAuctionService.placeBid(eventProductId, userId);
        return ResponseEntity.ok(ApiResponse.success("Đặt giá thành công", response));
    }

    @GetMapping("/penny/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPennyStatus(
            @PathVariable Long eventId,
            @PathVariable Long eventProductId
    ) {
        Map<String, Object> status = pennyAuctionService.getPennyStatus(eventProductId);
        return ResponseEntity.ok(ApiResponse.success(status));
    }
}
