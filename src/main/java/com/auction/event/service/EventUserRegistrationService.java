package com.auction.event.service;

import com.auction.event.dto.EventResponse;

import java.util.List;

public interface EventUserRegistrationService {
    EventResponse registerAsBidder(Long eventId, Long userId);
    void unregister(Long eventId, Long userId);
    List<EventResponse> listMyEvents(Long userId);
}
