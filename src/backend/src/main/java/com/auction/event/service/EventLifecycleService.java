package com.auction.event.service;

import com.auction.event.dto.CreateEventRequest;
import com.auction.event.dto.EventResponse;
import com.auction.event.dto.EventStatsResponse;
import com.auction.event.dto.UpdateEventRequest;

import java.util.List;

public interface EventLifecycleService {
    EventResponse createEvent(CreateEventRequest request, Long adminId);
    EventResponse updateEvent(Long eventId, UpdateEventRequest request, Long adminId);
    EventResponse getEventById(Long eventId);
    EventResponse getPublicEventById(Long eventId);
    EventResponse getEventBySlug(String slug);
    List<EventResponse> getAllEvents();
    List<EventResponse> getPublicEvents();
    EventResponse publishEvent(Long eventId, Long adminId);
    EventResponse cancelEvent(Long eventId, Long adminId);
    EventStatsResponse getEventStats(Long eventId);
}
