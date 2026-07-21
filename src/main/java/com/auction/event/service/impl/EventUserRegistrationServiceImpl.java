package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventResponse;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventRegistration;
import com.auction.event.enums.EventRegistrationRole;
import com.auction.event.enums.EventRegistrationStatus;
import com.auction.event.enums.EventStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.service.EventUserRegistrationService;
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
public class EventUserRegistrationServiceImpl implements EventUserRegistrationService {

    private final AuctionEventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    @Override
    @Transactional
    public EventResponse registerAsBidder(Long eventId, Long userId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStatus() != EventStatus.PUBLISHED && event.getStatus() != EventStatus.ONGOING) {
            throw new BusinessException("Không thể đăng ký sự kiện này");
        }

        if (event.getRegistrationDeadline() != null && LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new BusinessException("Đã hết thời hạn đăng ký");
        }

        if (registrationRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new BusinessException("Bạn đã đăng ký sự kiện này rồi");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEventId(eventId);
        registration.setUserId(userId);
        registration.setRole(EventRegistrationRole.BIDDER);
        registration.setStatus(EventRegistrationStatus.REGISTERED);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setNotifyOnOpen(true);
        registrationRepository.save(registration);

        return EventResponse.fromEntity(event);
    }

    @Override
    @Transactional
    public void unregister(Long eventId, Long userId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStatus() == EventStatus.ONGOING) {
            throw new BusinessException("Không thể hủy đăng ký khi sự kiện đang diễn ra");
        }

        EventRegistration registration = registrationRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new BusinessException("Bạn chưa đăng ký sự kiện này"));

        registration.setStatus(EventRegistrationStatus.CANCELLED);
        registrationRepository.save(registration);
    }

    @Override
    public List<EventResponse> listMyEvents(Long userId) {
        return registrationRepository.findByUserIdAndStatus(userId, EventRegistrationStatus.REGISTERED)
                .stream()
                .map(reg -> eventRepository.findById(reg.getEventId()).orElse(null))
                .filter(event -> event != null)
                .map(EventResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
