package com.auction.event.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.dto.EventResponse;
import com.auction.event.dto.SubmitExistingProductRequest;
import com.auction.event.dto.SubmitNewProductRequest;
import com.auction.event.service.EventSellerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('Seller')")
public class SellerEventController {

    private final EventSellerService eventSellerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> listOpenEvents() {
        List<EventResponse> events = eventSellerService.listOpenEventsForSeller();
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @PostMapping("/{eventId}/register")
    public ResponseEntity<ApiResponse<EventResponse>> registerAsSeller(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long sellerId = currentUser.getId();
        EventResponse response = eventSellerService.registerAsSeller(eventId, sellerId);
        return ResponseEntity.ok(ApiResponse.success("Registered as seller for event successfully", response));
    }

    @PostMapping("/{eventId}/products/existing")
    public ResponseEntity<ApiResponse<EventProductResponse>> submitExistingProduct(
            @PathVariable Long eventId,
            @RequestBody SubmitExistingProductRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long sellerId = currentUser.getId();
        EventProductResponse response = eventSellerService.submitExistingProduct(eventId, sellerId, request);
        return ResponseEntity.ok(ApiResponse.success("Product submitted successfully", response));
    }

    @PostMapping("/{eventId}/products/new")
    public ResponseEntity<ApiResponse<EventProductResponse>> submitNewProduct(
            @PathVariable Long eventId,
            @RequestBody SubmitNewProductRequest request,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long sellerId = currentUser.getId();
        EventProductResponse response = eventSellerService.submitNewProduct(eventId, sellerId, request);
        return ResponseEntity.ok(ApiResponse.success("New product submitted successfully", response));
    }

    @DeleteMapping("/products/{eventProductId}")
    public ResponseEntity<ApiResponse<Void>> withdrawSubmission(
            @PathVariable Long eventProductId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long sellerId = currentUser.getId();
        eventSellerService.withdrawSubmission(eventProductId, sellerId);
        return ResponseEntity.ok(ApiResponse.success("Submission withdrawn successfully", null));
    }

    @GetMapping("/{eventId}/my-submissions")
    public ResponseEntity<ApiResponse<List<EventProductResponse>>> listMySubmissions(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Long sellerId = currentUser.getId();
        List<EventProductResponse> submissions = eventSellerService.listMySubmissions(eventId, sellerId);
        return ResponseEntity.ok(ApiResponse.success(submissions));
    }
}
