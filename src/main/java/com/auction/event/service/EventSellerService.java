package com.auction.event.service;

import com.auction.event.dto.EventProductResponse;
import com.auction.event.dto.EventResponse;
import com.auction.event.dto.SubmitExistingProductRequest;
import com.auction.event.dto.SubmitNewProductRequest;

import java.util.List;

public interface EventSellerService {
    List<EventResponse> listOpenEventsForSeller();
    EventResponse registerAsSeller(Long eventId, Long sellerId);
    EventProductResponse submitExistingProduct(Long eventId, Long sellerId, SubmitExistingProductRequest request);
    EventProductResponse submitNewProduct(Long eventId, Long sellerId, SubmitNewProductRequest request);
    void withdrawSubmission(Long eventProductId, Long sellerId);
    List<EventProductResponse> listMySubmissions(Long eventId, Long sellerId);
}
