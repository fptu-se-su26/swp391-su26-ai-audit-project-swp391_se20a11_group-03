package com.auction.event.service.impl;

import com.auction.event.service.EventNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventNotificationServiceImpl implements EventNotificationService {

    @Override
    public void notifyEventCancelled(Long eventId) {
        // TODO: Implement actual notification logic
        log.info("Notifying users that event {} has been cancelled", eventId);
    }
}
