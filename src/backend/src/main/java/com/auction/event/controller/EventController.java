package com.auction.event.controller;

import com.auction.common.dto.ApiResponse;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.dto.EventResponse;
import com.auction.event.service.EventLifecycleService;
import com.auction.event.service.EventProductAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventLifecycleService eventLifecycleService;
    private final EventProductAssignmentService eventProductAssignmentService;

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
}
