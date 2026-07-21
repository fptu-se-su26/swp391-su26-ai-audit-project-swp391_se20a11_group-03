package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.CreateEventRequest;
import com.auction.event.dto.EventResponse;
import com.auction.event.dto.EventStatsResponse;
import com.auction.event.dto.UpdateEventRequest;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.enums.BiddingMode;
import com.auction.event.enums.EventProductApprovalStatus;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.enums.EventRegistrationRole;
import com.auction.event.enums.EventStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.service.EventLifecycleService;
import com.auction.event.service.EventNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventLifecycleServiceImpl implements EventLifecycleService {

    private final AuctionEventRepository eventRepository;
    private final EventProductRepository eventProductRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventNotificationService eventNotificationService;

    @Override
    @Transactional
    public EventResponse createEvent(CreateEventRequest request, Long adminId) {
        validateEventRequest(request);

        if (eventRepository.existsBySlug(request.getSlug())) {
            throw new BusinessException("Slug already exists: " + request.getSlug());
        }

        AuctionEvent event = new AuctionEvent();
        event.setName(request.getName());
        event.setSlug(request.getSlug());
        event.setDescription(request.getDescription());
        event.setBannerUrl(request.getBannerUrl());
        event.setEventCategory(request.getEventCategory());
        event.setBiddingMode(request.getBiddingMode());
        event.setCharity(request.getIsCharity() != null ? request.getIsCharity() : false);
        event.setCharityPercent(request.getCharityPercent());
        event.setRegistrationOpenAt(request.getRegistrationOpenAt());
        event.setRegistrationDeadline(request.getRegistrationDeadline());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setStatus(EventStatus.DRAFT);
        event.setRulesText(request.getRulesText());
        event.setRewardDescription(request.getRewardDescription());
        event.setDutchConfigJson(request.getDutchConfigJson());
        event.setSealedConfigJson(request.getSealedConfigJson());
        event.setPennyConfigJson(request.getPennyConfigJson());
        event.setAllowSellerSubmission(request.getAllowSellerSubmission() != null ? request.getAllowSellerSubmission() : true);
        event.setCreatedBy(adminId);
        event.setCreatedAt(LocalDateTime.now());

        validateBiddingModeConfig(event);

        event = eventRepository.save(event);
        return EventResponse.fromEntity(event);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long eventId, UpdateEventRequest request, Long adminId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStatus() != EventStatus.DRAFT) {
            if (request.getBiddingMode() != null && !request.getBiddingMode().equals(event.getBiddingMode())) {
                throw new BusinessException("Cannot change bidding mode after event is published");
            }
            if (request.getStartTime() != null && request.getStartTime().isBefore(event.getStartTime())) {
                throw new BusinessException("Cannot set start time earlier than original start time after event is published");
            }
        }

        if (request.getName() != null) event.setName(request.getName());
        if (request.getSlug() != null && !request.getSlug().equals(event.getSlug())) {
            if (eventRepository.existsBySlug(request.getSlug())) {
                throw new BusinessException("Slug already exists: " + request.getSlug());
            }
            event.setSlug(request.getSlug());
        }
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getBannerUrl() != null) event.setBannerUrl(request.getBannerUrl());
        if (request.getEventCategory() != null) event.setEventCategory(request.getEventCategory());
        if (request.getIsCharity() != null) event.setCharity(request.getIsCharity());
        if (request.getCharityPercent() != null) event.setCharityPercent(request.getCharityPercent());
        if (request.getRegistrationOpenAt() != null) event.setRegistrationOpenAt(request.getRegistrationOpenAt());
        if (request.getRegistrationDeadline() != null) event.setRegistrationDeadline(request.getRegistrationDeadline());
        if (request.getStartTime() != null) event.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) event.setEndTime(request.getEndTime());
        if (request.getRulesText() != null) event.setRulesText(request.getRulesText());
        if (request.getRewardDescription() != null) event.setRewardDescription(request.getRewardDescription());
        if (request.getDutchConfigJson() != null) event.setDutchConfigJson(request.getDutchConfigJson());
        if (request.getSealedConfigJson() != null) event.setSealedConfigJson(request.getSealedConfigJson());
        if (request.getPennyConfigJson() != null) event.setPennyConfigJson(request.getPennyConfigJson());
        if (request.getAllowSellerSubmission() != null) event.setAllowSellerSubmission(request.getAllowSellerSubmission());

        event.setUpdatedAt(LocalDateTime.now());

        validateEventRequest(event);
        validateBiddingModeConfig(event);

        event = eventRepository.save(event);
        return EventResponse.fromEntity(event);
    }

    @Override
    public EventResponse getEventById(Long eventId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));
        EventResponse response = EventResponse.fromEntity(event);

        Map<String, Long> productCountByStatus = new HashMap<>();
        for (EventProductApprovalStatus status : EventProductApprovalStatus.values()) {
            productCountByStatus.put(status.name(), eventProductRepository.countByEventIdAndApprovalStatus(eventId, status));
        }
        response.setProductCountByStatus(productCountByStatus);

        return response;
    }

    @Override
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(EventResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventResponse publishEvent(Long eventId, Long adminId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStatus() != EventStatus.DRAFT) {
            throw new BusinessException("Event is already " + event.getStatus());
        }

        List<String> missingRequirements = new java.util.ArrayList<>();

        Long approvedProductCount = eventProductRepository.countByEventIdAndApprovalStatus(eventId, EventProductApprovalStatus.APPROVED);
        if (approvedProductCount == 0) {
            missingRequirements.add("At least one approved product is required");
        }

        if (event.getBannerUrl() == null || event.getBannerUrl().isBlank()) {
            missingRequirements.add("Banner URL is required");
        }

        if (event.getDescription() == null || event.getDescription().isBlank()) {
            missingRequirements.add("Description is required");
        }

        if (!missingRequirements.isEmpty()) {
            throw new BusinessException("Cannot publish event: " + String.join(", ", missingRequirements));
        }

        event.setStatus(EventStatus.PUBLISHED);
        event.setUpdatedAt(LocalDateTime.now());
        event = eventRepository.save(event);

        return EventResponse.fromEntity(event);
    }

    @Override
    @Transactional
    public EventResponse cancelEvent(Long eventId, Long adminId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStatus() == EventStatus.ONGOING || event.getStatus() == EventStatus.ENDED || event.getStatus() == EventStatus.ARCHIVED) {
            throw new BusinessException("Cannot cancel event that is " + event.getStatus());
        }

        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new BusinessException("Event is already cancelled");
        }

        event.setStatus(EventStatus.CANCELLED);
        event.setUpdatedAt(LocalDateTime.now());
        event = eventRepository.save(event);

        eventNotificationService.notifyEventCancelled(eventId);

        return EventResponse.fromEntity(event);
    }

    @Override
    public EventStatsResponse getEventStats(Long eventId) {
        EventStatsResponse stats = new EventStatsResponse();

        stats.setTotalBidders(eventRegistrationRepository.countByEventIdAndRole(eventId, EventRegistrationRole.BIDDER));
        stats.setTotalSellers(eventRegistrationRepository.countByEventIdAndRole(eventId, EventRegistrationRole.SELLER));

        Map<String, Long> productCountBySessionStatus = new HashMap<>();
        for (EventProductSessionStatus status : EventProductSessionStatus.values()) {
            productCountBySessionStatus.put(status.name(), eventProductRepository.countByEventIdAndSessionStatus(eventId, status));
        }
        stats.setProductCountBySessionStatus(productCountBySessionStatus);

        Long soldProducts = eventProductRepository.countByEventIdAndSessionStatus(eventId, EventProductSessionStatus.ENDED_SOLD);
        stats.setTotalSoldProducts(soldProducts);

        // TODO: Calculate total final price
        stats.setTotalFinalPrice(0L);

        Long totalProducts = eventProductRepository.findByEventId(eventId).size();
        stats.setSoldRatio(totalProducts > 0 ? (double) soldProducts / totalProducts * 100 : 0.0);

        return stats;
    }

    private void validateEventRequest(CreateEventRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new BusinessException("Start time and end time are required");
        }
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BusinessException("Start time must be before end time");
        }
        if (request.getRegistrationDeadline() != null && request.getRegistrationDeadline().isAfter(request.getStartTime())) {
            throw new BusinessException("Registration deadline must be before start time");
        }
        if (request.getIsCharity() != null && request.getIsCharity()) {
            if (request.getCharityPercent() == null || request.getCharityPercent() <= 0 || request.getCharityPercent() > 100) {
                throw new BusinessException("Charity percent must be between 1 and 100 when isCharity is true");
            }
        }
    }

    private void validateEventRequest(AuctionEvent event) {
        if (event.getStartTime() == null || event.getEndTime() == null) {
            throw new BusinessException("Start time and end time are required");
        }
        if (event.getStartTime().isAfter(event.getEndTime())) {
            throw new BusinessException("Start time must be before end time");
        }
        if (event.getRegistrationDeadline() != null && event.getRegistrationDeadline().isAfter(event.getStartTime())) {
            throw new BusinessException("Registration deadline must be before start time");
        }
        if (event.isCharity()) {
            if (event.getCharityPercent() == null || event.getCharityPercent() <= 0 || event.getCharityPercent() > 100) {
                throw new BusinessException("Charity percent must be between 1 and 100 when isCharity is true");
            }
        }
    }

    private void validateBiddingModeConfig(AuctionEvent event) {
        BiddingMode mode = event.getBiddingMode();
        int configCount = 0;
        if (event.getDutchConfigJson() != null && !event.getDutchConfigJson().isBlank()) configCount++;
        if (event.getSealedConfigJson() != null && !event.getSealedConfigJson().isBlank()) configCount++;
        if (event.getPennyConfigJson() != null && !event.getPennyConfigJson().isBlank()) configCount++;

        if (mode == BiddingMode.DUTCH) {
            if (event.getDutchConfigJson() == null || event.getDutchConfigJson().isBlank()) {
                throw new BusinessException("Dutch config is required for DUTCH bidding mode");
            }
            if (configCount > 1) {
                throw new BusinessException("Only Dutch config should be provided for DUTCH bidding mode");
            }
        } else if (mode == BiddingMode.SEALED_BID) {
            if (event.getSealedConfigJson() == null || event.getSealedConfigJson().isBlank()) {
                throw new BusinessException("Sealed config is required for SEALED_BID bidding mode");
            }
            if (configCount > 1) {
                throw new BusinessException("Only Sealed config should be provided for SEALED_BID bidding mode");
            }
        } else if (mode == BiddingMode.PENNY) {
            if (event.getPennyConfigJson() == null || event.getPennyConfigJson().isBlank()) {
                throw new BusinessException("Penny config is required for PENNY bidding mode");
            }
            if (configCount > 1) {
                throw new BusinessException("Only Penny config should be provided for PENNY bidding mode");
            }
        } else {
            if (configCount > 0) {
                throw new BusinessException("No config should be provided for STANDARD bidding mode");
            }
        }
    }
}
