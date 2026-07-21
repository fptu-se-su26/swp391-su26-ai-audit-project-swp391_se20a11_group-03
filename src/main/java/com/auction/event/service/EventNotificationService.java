package com.auction.event.service;

public interface EventNotificationService {
    void notifyEventPublished(Long eventId);
    void notifyEventOngoing(Long eventId);
    void notifyEventCancelled(Long eventId);
    void notifyEventEnded(Long eventId, Long userId, Boolean won);
}
