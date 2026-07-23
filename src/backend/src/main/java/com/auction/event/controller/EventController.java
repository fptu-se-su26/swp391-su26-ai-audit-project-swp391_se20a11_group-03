package com.auction.event.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.dto.EventResponse;
import com.auction.event.enums.EventProductApprovalStatus;
import com.auction.event.service.EventLifecycleService;
import com.auction.event.service.EventPaymentService;
import com.auction.event.service.EventProductAssignmentService;
import com.auction.event.service.EventUserRegistrationService;
import com.auction.order.dto.ShippingAddressRequest;
import jakarta.validation.Valid;
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
    private final EventPaymentService eventPaymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        List<EventResponse> events = eventLifecycleService.getPublicEvents();
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<EventResponse>> getEvent(@PathVariable Long eventId) {
        EventResponse event = eventLifecycleService.getPublicEventById(eventId);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventBySlug(@PathVariable String slug) {
        EventResponse event = eventLifecycleService.getEventBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(event));
    }

    @GetMapping("/{eventId}/products")
    public ResponseEntity<ApiResponse<List<EventProductResponse>>> getEventProducts(@PathVariable Long eventId) {
        eventLifecycleService.getPublicEventById(eventId);
        List<EventProductResponse> products = eventProductAssignmentService.getEventProducts(eventId).stream()
                .filter(product -> product.getApprovalStatus() == EventProductApprovalStatus.APPROVED)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/{eventProductId}")
    public ResponseEntity<ApiResponse<EventProductResponse>> getEventProduct(@PathVariable Long eventProductId) {
        EventProductResponse product = eventProductAssignmentService.getEventProductById(eventProductId);
        eventLifecycleService.getPublicEventById(product.getEventId());
        if (product.getApprovalStatus() != EventProductApprovalStatus.APPROVED) {
            throw new ResourceNotFoundException("Không tìm thấy sản phẩm sự kiện");
        }
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    @PostMapping("/{eventId}/register")
    @PreAuthorize("hasAnyRole('User','Seller','Admin')")
    public ResponseEntity<ApiResponse<EventResponse>> registerAsBidder(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        EventResponse response = eventUserRegistrationService.registerAsBidder(eventId, userId);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký tham gia sự kiện thành công", response));
    }

    @PostMapping("/{eventId}/unregister")
    @PreAuthorize("hasAnyRole('User','Seller','Admin')")
    public ResponseEntity<ApiResponse<Void>> unregister(
            @PathVariable Long eventId,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        eventUserRegistrationService.unregister(eventId, userId);
        return ResponseEntity.ok(ApiResponse.success("Hủy đăng ký thành công", null));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('User','Seller','Admin')")
    public ResponseEntity<ApiResponse<List<EventResponse>>> listMyEvents(
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        Long userId = currentUser.getId();
        List<EventResponse> events = eventUserRegistrationService.listMyEvents(userId);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    /** Winner pays real money for a won event product to receive the goods. */
    @PostMapping("/products/{eventProductId}/pay")
    @PreAuthorize("hasAnyRole('User','Seller','Admin')")
    public ResponseEntity<ApiResponse<Void>> payEventProduct(
            @PathVariable Long eventProductId,
            @Valid @RequestBody ShippingAddressRequest address,
            @AuthenticationPrincipal UserDetailsImpl currentUser
    ) {
        eventPaymentService.payEventProduct(eventProductId, currentUser.getId(), address);
        return ResponseEntity.ok(ApiResponse.success("Thanh toán thành công", null));
    }
}
