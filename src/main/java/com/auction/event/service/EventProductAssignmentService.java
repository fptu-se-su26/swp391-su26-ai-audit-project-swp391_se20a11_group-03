package com.auction.event.service;

import com.auction.event.dto.EventProductResponse;

import java.util.List;

public interface EventProductAssignmentService {
    EventProductResponse assignExistingProduct(Long eventId, Long productId, Long adminId);
    EventProductResponse approveSubmission(Long eventProductId, Long adminId);
    EventProductResponse rejectSubmission(Long eventProductId, String reason, Long adminId);
    void removeProductFromEvent(Long eventProductId, Long adminId);
    List<EventProductResponse> getEventProducts(Long eventId);
    EventProductResponse getEventProductById(Long eventProductId);
}
