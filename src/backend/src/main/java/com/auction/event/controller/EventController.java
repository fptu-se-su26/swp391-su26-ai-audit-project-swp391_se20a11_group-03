package com.auction.event.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.dto.EventResponse;
import com.auction.event.service.EventLifecycleService;
import com.auction.event.service.EventProductAssignmentService;
import com.auction.event.service.EventUserRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventLifecycleService eventLifecycleService;
    private final EventProductAssignmentService eventProductAssignmentService;
    private final EventUserRegistrationService eventUserRegistrationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        List<EventResponse> events = eventLifecycleService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable Long eventId) {
        EventResponse event = eventLifecycleService.getEventById(eventId);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @GetMapping("/{eventId}/products")
    public ResponseEntity<ApiResponse<List<EventProductResponse>>> getEventProducts(@PathVariable Long eventId) {
        List<EventProductResponse> products = eventProductAssignmentService.getEventProducts(eventId);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/{eventProductId}")
    public ResponseEntity<ApiResponse<EventProductResponse>> getEventProduct(@PathVariable Long eventProductId) {
        EventProductResponse product = eventProductAssignmentService.getEventProductById(eventProductId);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @PostMapping("/{eventId}/register")
    @PreAuthorize("hasRole('USER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<EventResponse>> registerAsBidder(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        EventResponse response = eventUserRegistrationService.registerAsBidder(eventId, userId);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký tham gia sự kiện thành công", response));
    }

    @PostMapping("/{eventId}/unregister")
    @PreAuthorize("hasRole('USER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unregister(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        eventUserRegistrationService.unregister(eventId, userId);
        return ResponseEntity.ok(ApiResponse.success("Hủy đăng ký thành công", null));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER') or hasRole('SELLER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<EventResponse>>> listMyEvents(
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        List<EventResponse> events = eventUserRegistrationService.listMyEvents(userId);
        return ResponseEntity.ok(ApiResponse.success(events));
    }
}
