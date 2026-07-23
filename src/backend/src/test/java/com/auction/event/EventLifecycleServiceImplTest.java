package com.auction.event;

import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventResponse;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.enums.EventStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.service.EventNotificationService;
import com.auction.event.service.impl.EventLifecycleServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventLifecycleServiceImplTest {

    @Mock AuctionEventRepository eventRepository;
    @Mock EventProductRepository eventProductRepository;
    @Mock EventRegistrationRepository eventRegistrationRepository;
    @Mock EventNotificationService eventNotificationService;

    @InjectMocks EventLifecycleServiceImpl lifecycleService;

    @Test
    void publicList_containsOnlyPublishedOngoingAndEndedEvents() {
        AuctionEvent draft = event(1L, "draft", EventStatus.DRAFT);
        AuctionEvent published = event(2L, "published", EventStatus.PUBLISHED);
        AuctionEvent ongoing = event(3L, "ongoing", EventStatus.ONGOING);
        AuctionEvent ended = event(4L, "ended", EventStatus.ENDED);
        AuctionEvent cancelled = event(5L, "cancelled", EventStatus.CANCELLED);
        AuctionEvent archived = event(6L, "archived", EventStatus.ARCHIVED);
        when(eventRepository.findAll()).thenReturn(List.of(
                draft, published, ongoing, ended, cancelled, archived));

        List<EventResponse> publicEvents = lifecycleService.getPublicEvents();

        assertEquals(List.of(2L, 3L, 4L),
                publicEvents.stream().map(EventResponse::getEventId).toList());
        assertEquals(6, lifecycleService.getAllEvents().size());
    }

    @Test
    void publicSlug_hidesDraftEventAsNotFound() {
        AuctionEvent draft = event(1L, "draft", EventStatus.DRAFT);
        when(eventRepository.findBySlug("draft")).thenReturn(Optional.of(draft));

        assertThrows(ResourceNotFoundException.class,
                () -> lifecycleService.getEventBySlug("draft"));
    }

    private AuctionEvent event(Long id, String slug, EventStatus status) {
        AuctionEvent event = new AuctionEvent();
        event.setEventId(id);
        event.setName(slug);
        event.setSlug(slug);
        event.setStatus(status);
        return event;
    }
}
