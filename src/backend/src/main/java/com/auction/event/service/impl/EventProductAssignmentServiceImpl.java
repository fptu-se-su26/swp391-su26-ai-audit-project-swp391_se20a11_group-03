package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventProductResponse;
import com.auction.event.dto.SubmitNewProductRequest;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.enums.EventProductApprovalStatus;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.enums.EventProductSourceType;
import com.auction.event.enums.EventStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.service.EventProductAssignmentService;
import com.auction.product.dto.AvailableProductForEventDTO;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import com.auction.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventProductAssignmentServiceImpl implements EventProductAssignmentService {

    private final AuctionEventRepository eventRepository;
    private final EventProductRepository eventProductRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Override
    @Transactional
    public EventProductResponse createAdminProduct(Long eventId, SubmitNewProductRequest request, Long adminId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        var created = productService.createProduct(request, adminId);
        Product product = productRepository.findById(created.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product was not created"));
        product.setStatus("APPROVED");
        product.setLockedInEvent(true);
        productRepository.save(product);

        EventProduct eventProduct = new EventProduct();
        eventProduct.setEventId(eventId);
        eventProduct.setProductId(product.getProductId());
        eventProduct.setSourceType(EventProductSourceType.NEW_SUBMISSION);
        eventProduct.setSubmittedBySellerId(adminId);
        eventProduct.setApprovalStatus(EventProductApprovalStatus.APPROVED);
        eventProduct.setStartingPrice(request.getStartingPrice());
        eventProduct.setCurrentPrice(request.getStartingPrice());
        eventProduct.setPriceStep(request.getStepPrice());
        eventProduct.setReservePrice(request.getReservePrice());
        eventProduct.setSessionStatus(EventProductSessionStatus.SCHEDULED);
        eventProduct.setSessionStart(event.getStartTime());
        eventProduct.setSessionEnd(event.getEndTime());
        eventProduct.setDisplayOrder((int) eventProductRepository
                .countByEventIdAndApprovalStatus(eventId, EventProductApprovalStatus.APPROVED).longValue());
        return EventProductResponse.fromEntity(eventProductRepository.save(eventProduct));
    }

    @Override
    @Transactional
    public EventProductResponse assignExistingProduct(Long eventId, Long productId, Long adminId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        if (!"APPROVED".equals(product.getStatus())) {
            throw new BusinessException("Only approved products can be assigned to events");
        }

        if (product.isLockedInEvent()) {
            throw new BusinessException("Product is already locked in another event");
        }

        EventProduct existing = eventProductRepository.findByEventIdAndProductId(eventId, productId).orElse(null);
        if (existing != null) {
            throw new BusinessException("Product is already in this event");
        }

        EventProduct eventProduct = new EventProduct();
        eventProduct.setEventId(eventId);
        eventProduct.setProductId(productId);
        eventProduct.setSourceType(EventProductSourceType.EXISTING_PRODUCT);
        eventProduct.setSubmittedBySellerId(product.getSellerId());
        eventProduct.setApprovalStatus(EventProductApprovalStatus.APPROVED);
        eventProduct.setStartingPrice(product.getStartingPrice());
        eventProduct.setCurrentPrice(product.getStartingPrice());
        eventProduct.setPriceStep(product.getStepPrice());
        eventProduct.setSessionStatus(EventProductSessionStatus.SCHEDULED);
        eventProduct.setSessionStart(event.getStartTime());
        eventProduct.setSessionEnd(event.getEndTime());

        eventProduct = eventProductRepository.save(eventProduct);

        product.setLockedInEvent(true);
        productRepository.save(product);

        return EventProductResponse.fromEntity(eventProduct);
    }

    @Override
    @Transactional
    public EventProductResponse approveSubmission(Long eventProductId, Long adminId) {
        EventProduct eventProduct = eventProductRepository.findById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found with id: " + eventProductId));

        if (eventProduct.getApprovalStatus() != EventProductApprovalStatus.PENDING) {
            throw new BusinessException("Submission is already " + eventProduct.getApprovalStatus());
        }

        eventProduct.setApprovalStatus(EventProductApprovalStatus.APPROVED);
        eventProduct.setRejectReason(null);

        if (eventProduct.getProductId() != null) {
            Long productId = eventProduct.getProductId();
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
            product.setLockedInEvent(true);
            productRepository.save(product);
        }

        eventProduct = eventProductRepository.save(eventProduct);
        return EventProductResponse.fromEntity(eventProduct);
    }

    @Override
    @Transactional
    public EventProductResponse rejectSubmission(Long eventProductId, String reason, Long adminId) {
        EventProduct eventProduct = eventProductRepository.findById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found with id: " + eventProductId));

        if (eventProduct.getApprovalStatus() != EventProductApprovalStatus.PENDING) {
            throw new BusinessException("Submission is already " + eventProduct.getApprovalStatus());
        }

        eventProduct.setApprovalStatus(EventProductApprovalStatus.REJECTED);
        eventProduct.setRejectReason(reason);
        if (eventProduct.getSessionStatus() == EventProductSessionStatus.SCHEDULED) {
            eventProduct.setSessionStatus(EventProductSessionStatus.CANCELLED);
        }
        eventProduct = eventProductRepository.save(eventProduct);

        return EventProductResponse.fromEntity(eventProduct);
    }

    @Override
    @Transactional
    public void removeProductFromEvent(Long eventProductId, Long adminId) {
        EventProduct eventProduct = eventProductRepository.findById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found with id: " + eventProductId));

        if (eventProduct.getSessionStatus() != EventProductSessionStatus.SCHEDULED) {
            throw new BusinessException("Can only remove products that are scheduled, not " + eventProduct.getSessionStatus());
        }

        if (eventProduct.getProductId() != null) {
            Product product = productRepository.findById(eventProduct.getProductId())
                    .orElse(null);
            if (product != null) {
                product.setLockedInEvent(false);
                productRepository.save(product);
            }
        }

        eventProduct.setSessionStatus(EventProductSessionStatus.CANCELLED);
        eventProductRepository.save(eventProduct);
    }

    @Override
    public List<EventProductResponse> getEventProducts(Long eventId) {
        return eventProductRepository.findByEventIdOrderByDisplayOrderAscEventProductIdAsc(eventId).stream()
                .map(EventProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<EventProductResponse> reorderProducts(Long eventId, List<Long> eventProductIds) {
        List<EventProduct> approved = eventProductRepository
                .findByEventIdAndApprovalStatus(eventId, EventProductApprovalStatus.APPROVED)
                .stream()
                .filter(product -> product.getSessionStatus() != EventProductSessionStatus.CANCELLED)
                .collect(Collectors.toList());
        if (approved.size() != eventProductIds.size()
                || !approved.stream().map(EventProduct::getEventProductId).collect(Collectors.toSet())
                .equals(new java.util.HashSet<>(eventProductIds))) {
            throw new BusinessException("Danh sách sắp xếp không khớp với sản phẩm đã duyệt của sự kiện");
        }
        java.util.Map<Long, EventProduct> byId = approved.stream()
                .collect(Collectors.toMap(EventProduct::getEventProductId, product -> product));
        for (int index = 0; index < eventProductIds.size(); index++) {
            byId.get(eventProductIds.get(index)).setDisplayOrder(index);
        }
        eventProductRepository.saveAll(approved);
        return getEventProducts(eventId);
    }

    @Override
    public EventProductResponse getEventProductById(Long eventProductId) {
        EventProduct eventProduct = eventProductRepository.findById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Event product not found with id: " + eventProductId));
        return EventProductResponse.fromEntity(eventProduct);
    }

    @Override
    public List<AvailableProductForEventDTO> getAvailableProducts() {
        return productRepository.findByStatusAndIsLockedInEventFalse("APPROVED").stream()
                .map(product -> AvailableProductForEventDTO.builder()
                        .productId(product.getProductId())
                        .productName(product.getProductName())
                        .sellerId(product.getSellerId())
                        .startingPrice(product.getStartingPrice())
                        .stepPrice(product.getStepPrice())
                        .build())
                .collect(Collectors.toList());
    }
}
