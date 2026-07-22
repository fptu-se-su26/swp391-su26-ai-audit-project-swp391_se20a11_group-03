package com.auction.event.controller;

import com.auction.common.dto.ApiResponse;
import com.auction.event.dto.CreateEventRequest;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.dto.EventResponse;
import com.auction.event.dto.EventStatsResponse;
import com.auction.event.dto.RejectSubmissionRequest;
import com.auction.event.dto.UpdateEventRequest;
import com.auction.event.service.EventLifecycleService;
import com.auction.event.service.EventProductAssignmentService;
import com.auction.product.dto.AvailableProductForEventDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
@PreAuthorize("hasRole('Admin')")
public class AdminEventController {

    private final EventLifecycleService eventLifecycleService;
    private final EventProductAssignmentService eventProductAssignmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(
            @RequestBody CreateEventRequest request,
            Authentication authentication) {
        Long adminId = getUserIdFromAuthentication(authentication);
        EventResponse response = eventLifecycleService.createEvent(request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Event created successfully", response));
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<ApiResponse<EventResponse>> updateEvent(
            @PathVariable Long eventId,
            @RequestBody UpdateEventRequest request,
            Authentication authentication) {
        Long adminId = getUserIdFromAuthentication(authentication);
        EventResponse response = eventLifecycleService.updateEvent(eventId, request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Event updated successfully", response));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable Long eventId) {
        EventResponse response = eventLifecycleService.getEventById(eventId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        List<EventResponse> responses = eventLifecycleService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/{eventId}/publish")
    public ResponseEntity<ApiResponse<EventResponse>> publishEvent(
            @PathVariable Long eventId,
            Authentication authentication) {
        Long adminId = getUserIdFromAuthentication(authentication);
        EventResponse response = eventLifecycleService.publishEvent(eventId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Event published successfully", response));
    }

    @PostMapping("/{eventId}/cancel")
    public ResponseEntity<ApiResponse<EventResponse>> cancelEvent(
            @PathVariable Long eventId,
            Authentication authentication) {
        Long adminId = getUserIdFromAuthentication(authentication);
        EventResponse response = eventLifecycleService.cancelEvent(eventId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Event cancelled successfully", response));
    }

    @GetMapping("/{eventId}/stats")
    public ResponseEntity<ApiResponse<EventStatsResponse>> getEventStats(@PathVariable Long eventId) {
        EventStatsResponse stats = eventLifecycleService.getEventStats(eventId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PostMapping("/{eventId}/products/existing/{productId}")
    public ResponseEntity<ApiResponse<EventProductResponse>> assignExistingProduct(
            @PathVariable Long eventId,
            @PathVariable Long productId,
            Authentication authentication) {
        Long adminId = getUserIdFromAuthentication(authentication);
        EventProductResponse response = eventProductAssignmentService.assignExistingProduct(eventId, productId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Product assigned to event successfully", response));
    }

    @PostMapping("/products/{eventProductId}/approve")
    public ResponseEntity<ApiResponse<EventProductResponse>> approveSubmission(
            @PathVariable Long eventProductId,
            Authentication authentication) {
        Long adminId = getUserIdFromAuthentication(authentication);
        EventProductResponse response = eventProductAssignmentService.approveSubmission(eventProductId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Submission approved successfully", response));
    }

    @PostMapping("/products/{eventProductId}/reject")
    public ResponseEntity<ApiResponse<EventProductResponse>> rejectSubmission(
            @PathVariable Long eventProductId,
            @RequestBody RejectSubmissionRequest request,
            Authentication authentication) {
        Long adminId = getUserIdFromAuthentication(authentication);
        EventProductResponse response = eventProductAssignmentService.rejectSubmission(eventProductId, request.getReason(), adminId);
        return ResponseEntity.ok(ApiResponse.success("Submission rejected successfully", response));
    }

    @DeleteMapping("/products/{eventProductId}")
    public ResponseEntity<ApiResponse<Void>> removeProductFromEvent(
            @PathVariable Long eventProductId,
            Authentication authentication) {
        Long adminId = getUserIdFromAuthentication(authentication);
        eventProductAssignmentService.removeProductFromEvent(eventProductId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Product removed from event successfully", null));
    }

    @GetMapping("/{eventId}/products")
    public ResponseEntity<ApiResponse<List<EventProductResponse>>> getEventProducts(@PathVariable Long eventId) {
        List<EventProductResponse> responses = eventProductAssignmentService.getEventProducts(eventId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/products/{eventProductId}")
    public ResponseEntity<ApiResponse<EventProductResponse>> getEventProduct(@PathVariable Long eventProductId) {
        EventProductResponse response = eventProductAssignmentService.getEventProductById(eventProductId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /** Approved products not currently locked into another event — used by the admin "add product" picker. */
    @GetMapping("/available-products")
    public ResponseEntity<ApiResponse<List<AvailableProductForEventDTO>>> getAvailableProducts() {
        List<AvailableProductForEventDTO> responses = eventProductAssignmentService.getAvailableProducts();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    private Long getUserIdFromAuthentication(Authentication authentication) {
        // TODO: Implement proper user ID extraction from authentication
        // For now, return a dummy admin ID
        return 1L;
    }
}
