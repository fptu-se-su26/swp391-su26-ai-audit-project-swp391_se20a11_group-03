package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.dto.EventResponse;
import com.auction.event.dto.SubmitExistingProductRequest;
import com.auction.event.dto.SubmitNewProductRequest;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.entity.EventRegistration;
import com.auction.event.enums.EventProductApprovalStatus;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.enums.EventProductSourceType;
import com.auction.event.enums.EventRegistrationRole;
import com.auction.event.enums.EventRegistrationStatus;
import com.auction.event.enums.EventStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.service.EventSellerService;
import com.auction.product.dto.ProductResponseDTO;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import com.auction.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventSellerServiceImpl implements EventSellerService {

    private final AuctionEventRepository eventRepository;
    private final EventProductRepository eventProductRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Override
    public List<EventResponse> listOpenEventsForSeller() {
        return eventRepository.findByStatusAndAllowSellerSubmission(EventStatus.PUBLISHED).stream()
                .map(EventResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventResponse registerAsSeller(Long eventId, Long sellerId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new BusinessException("Can only register for published events");
        }

        if (event.getRegistrationDeadline() != null && LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new BusinessException("Registration deadline has passed");
        }

        if (eventRegistrationRepository.existsByEventIdAndUserId(eventId, sellerId)) {
            throw new BusinessException("Already registered for this event");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEventId(eventId);
        registration.setUserId(sellerId);
        registration.setRole(EventRegistrationRole.SELLER);
        registration.setStatus(EventRegistrationStatus.REGISTERED);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setNotifyOnOpen(true);
        eventRegistrationRepository.save(registration);

        return EventResponse.fromEntity(event);
    }

    @Override
    @Transactional
    public EventProductResponse submitExistingProduct(Long eventId, Long sellerId, SubmitExistingProductRequest request) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (!event.isAllowSellerSubmission()) {
            throw new BusinessException("Seller submissions are not allowed for this event");
        }

        if (event.getStatus() == EventStatus.ONGOING || event.getStatus() == EventStatus.ENDED) {
            throw new BusinessException("Can't submit products for ongoing or ended events");
        }

        if (!eventRegistrationRepository.existsByEventIdAndUserId(eventId, sellerId)) {
            registerAsSeller(eventId, sellerId);
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.getSellerId().equals(sellerId)) {
            throw new BusinessException("You don't own this product");
        }

        if (!"APPROVED".equals(product.getStatus())) {
            throw new BusinessException("Only approved products can be submitted");
        }

        if (product.isLockedInEvent()) {
            throw new BusinessException("Product is already locked in another event");
        }

        EventProduct existing = eventProductRepository.findByEventIdAndProductId(eventId, request.getProductId()).orElse(null);
        if (existing != null) {
            throw new BusinessException("Product is already submitted for this event");
        }

        EventProduct eventProduct = new EventProduct();
        eventProduct.setEventId(eventId);
        eventProduct.setProductId(request.getProductId());
        eventProduct.setSourceType(EventProductSourceType.EXISTING_PRODUCT);
        eventProduct.setSubmittedBySellerId(sellerId);
        eventProduct.setApprovalStatus(EventProductApprovalStatus.PENDING);
        eventProduct.setStartingPrice(product.getStartingPrice());
        eventProduct.setCurrentPrice(product.getStartingPrice());
        eventProduct.setPriceStep(product.getStepPrice());
        eventProduct.setSessionStatus(EventProductSessionStatus.SCHEDULED);
        eventProduct.setSessionStart(event.getStartTime());
        eventProduct.setSessionEnd(event.getEndTime());
        eventProduct = eventProductRepository.save(eventProduct);

        return EventProductResponse.fromEntity(eventProduct);
    }

    @Override
    @Transactional
    public EventProductResponse submitNewProduct(Long eventId, Long sellerId, SubmitNewProductRequest request) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (!event.isAllowSellerSubmission()) {
            throw new BusinessException("Seller submissions are not allowed for this event");
        }

        if (event.getStatus() == EventStatus.ONGOING || event.getStatus() == EventStatus.ENDED) {
            throw new BusinessException("Can't submit products for ongoing or ended events");
        }

        if (!eventRegistrationRepository.existsByEventIdAndUserId(eventId, sellerId)) {
            registerAsSeller(eventId, sellerId);
        }

        ProductResponseDTO product = productService.createProduct(request, sellerId);

        EventProduct eventProduct = new EventProduct();
        eventProduct.setEventId(eventId);
        eventProduct.setProductId(product.getProductId());
        eventProduct.setSourceType(EventProductSourceType.NEW_SUBMISSION);
        eventProduct.setSubmittedBySellerId(sellerId);
        eventProduct.setApprovalStatus(EventProductApprovalStatus.PENDING);
        eventProduct.setStartingPrice(request.getStartingPrice() != null ? request.getStartingPrice() : product.getStartingPrice());
        eventProduct.setCurrentPrice(eventProduct.getStartingPrice());
        eventProduct.setPriceStep(request.getStepPrice());
        eventProduct.setReservePrice(request.getReservePrice());
        eventProduct.setSessionStatus(EventProductSessionStatus.SCHEDULED);
        eventProduct.setSessionStart(event.getStartTime());
        eventProduct.setSessionEnd(event.getEndTime());
        eventProduct = eventProductRepository.save(eventProduct);

        return EventProductResponse.fromEntity(eventProduct);
    }

    @Override
    @Transactional
    public void withdrawSubmission(Long eventProductId, Long sellerId) {
        EventProduct eventProduct = eventProductRepository.findById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found with id: " + eventProductId));

        if (!eventProduct.getSubmittedBySellerId().equals(sellerId)) {
            throw new BusinessException("You don't own this submission");
        }

        if (eventProduct.getApprovalStatus() == EventProductApprovalStatus.APPROVED &&
                eventProduct.getSessionStatus() != EventProductSessionStatus.SCHEDULED) {
            throw new BusinessException("Can't withdraw submission that is no longer scheduled");
        }

        if (eventProduct.getApprovalStatus() == EventProductApprovalStatus.APPROVED) {
            if (eventProduct.getProductId() != null) {
                Product product = productRepository.findById(eventProduct.getProductId()).orElse(null);
                if (product != null) {
                    product.setLockedInEvent(false);
                    productRepository.save(product);
                }
            }
        }

        eventProduct.setApprovalStatus(EventProductApprovalStatus.REJECTED);
        eventProduct.setSessionStatus(EventProductSessionStatus.CANCELLED);
        eventProduct.setRejectReason("Withdrawn by seller");
        eventProductRepository.save(eventProduct);
    }

    @Override
    public List<EventProductResponse> listMySubmissions(Long eventId, Long sellerId) {
        return eventProductRepository.findBySubmittedBySellerIdAndEventId(sellerId, eventId).stream()
                .map(EventProductResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
