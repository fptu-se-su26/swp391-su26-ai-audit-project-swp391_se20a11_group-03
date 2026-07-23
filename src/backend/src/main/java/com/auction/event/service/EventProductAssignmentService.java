package com.auction.event.service;

import com.auction.event.dto.EventProductResponse;
import com.auction.event.dto.SubmitNewProductRequest;
import com.auction.product.dto.AvailableProductForEventDTO;

import java.util.List;

public interface EventProductAssignmentService {
    EventProductResponse assignExistingProduct(Long eventId, Long productId, Long adminId);
    EventProductResponse createAdminProduct(Long eventId, SubmitNewProductRequest request, Long adminId);
    EventProductResponse approveSubmission(Long eventProductId, Long adminId);
    List<EventProductResponse> reorderProducts(Long eventId, List<Long> eventProductIds);
    EventProductResponse rejectSubmission(Long eventProductId, String reason, Long adminId);
    void removeProductFromEvent(Long eventProductId, Long adminId);
    List<EventProductResponse> getEventProducts(Long eventId);
    EventProductResponse getEventProductById(Long eventProductId);
    List<AvailableProductForEventDTO> getAvailableProducts();
}
