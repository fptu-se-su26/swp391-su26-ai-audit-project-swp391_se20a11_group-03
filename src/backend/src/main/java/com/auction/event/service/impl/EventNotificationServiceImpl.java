package com.auction.event.service.impl;

import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventRegistration;
import com.auction.event.enums.EventRegistrationStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.service.EventNotificationService;
import com.auction.notification.entity.Notification;
import com.auction.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventNotificationServiceImpl implements EventNotificationService {

    private final AuctionEventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final NotificationService notificationService;

    @Override
    @Async
    @Transactional
    public void notifyEventPublished(Long eventId) {
        AuctionEvent event = getEventById(eventId);
        String title = "Sự kiện đấu giá mới: " + event.getName();
        String message = "Sự kiện \"" + event.getName() + "\" đã được đăng ký. Đăng ký tham gia ngay!";
        // TODO: Optionally notify all users or specific ones
        log.info("Notifying users that event {} has been published", eventId);
    }

    @Override
    @Async
    @Transactional
    public void notifyEventOngoing(Long eventId) {
        AuctionEvent event = getEventById(eventId);
        List<EventRegistration> registrations = registrationRepository.findByEventIdAndStatus(eventId, EventRegistrationStatus.REGISTERED);
        String title = "Sự kiện bắt đầu: " + event.getName();
        String message = "Sự kiện \"" + event.getName() + "\" đã bắt đầu! Hãy tham gia đấu giá ngay!";
        registrations.forEach(reg -> {
            if (reg.isNotifyOnOpen()) {
                notificationService.createNotification(
                        reg.getUserId(),
                        title,
                        message,
                        Notification.NotificationType.EVENT_ONGOING,
                        eventId,
                        "AUCTION_EVENT"
                );
            }
        });
        log.info("Notified {} users that event {} is ongoing", registrations.size(), eventId);
    }

    @Override
    @Async
    @Transactional
    public void notifyEventCancelled(Long eventId) {
        AuctionEvent event = getEventById(eventId);
        List<EventRegistration> registrations = registrationRepository.findByEventIdAndStatus(eventId, EventRegistrationStatus.REGISTERED);
        String title = "Sự kiện đã bị hủy: " + event.getName();
        String message = "Sự kiện \"" + event.getName() + "\" đã bị hủy. Rất xin lỗi vì sự bất tiện này!";
        registrations.forEach(reg -> {
            notificationService.createNotification(
                    reg.getUserId(),
                    title,
                    message,
                    Notification.NotificationType.EVENT_CANCELLED,
                    eventId,
                    "AUCTION_EVENT"
            );
        });
        log.info("Notified {} users that event {} has been cancelled", registrations.size(), eventId);
    }

    @Override
    @Async
    @Transactional
    public void notifyEventEnded(Long eventId, Long userId, Boolean won) {
        AuctionEvent event = getEventById(eventId);
        String title = won ? "Chúc mừng bạn đã thắng đấu giá!" : "Sự kiện đấu giá đã kết thúc";
        String message = won ? "Chúc mừng bạn đã thắng sản phẩm trong sự kiện \"" + event.getName() + "\"!" : "Sự kiện \"" + event.getName() + "\" đã kết thúc. Cảm ơn bạn đã tham gia!";
        notificationService.createNotification(
                userId,
                title,
                message,
                won ? Notification.NotificationType.EVENT_WON : Notification.NotificationType.EVENT_LOST,
                eventId,
                "AUCTION_EVENT"
        );
        log.info("Notified user {} about event {} ended: won={}", userId, eventId, won);
    }

    private AuctionEvent getEventById(Long eventId) {
        return eventRepository.findById(eventId).orElse(null);
    }
}
