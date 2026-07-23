package com.auction.event.repository;

import com.auction.event.entity.AuctionEvent;
import com.auction.event.enums.EventStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AuctionEventRepository extends JpaRepository<AuctionEvent, Long> {
    Optional<AuctionEvent> findBySlug(String slug);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select e from AuctionEvent e where e.eventId = :eventId")
    Optional<AuctionEvent> findLockedById(@Param("eventId") Long eventId);

    List<AuctionEvent> findByStatus(EventStatus status);

    @Query("SELECT e FROM AuctionEvent e WHERE e.status = :status AND e.allowSellerSubmission = true")
    List<AuctionEvent> findByStatusAndAllowSellerSubmission(@Param("status") EventStatus status);

    @Query("SELECT e FROM AuctionEvent e WHERE e.startTime <= :now AND e.endTime > :now AND e.status = 'PUBLISHED'")
    List<AuctionEvent> findEventsToStart(@Param("now") LocalDateTime now);

    @Query("SELECT e FROM AuctionEvent e WHERE e.endTime <= :now AND e.status = 'ONGOING'")
    List<AuctionEvent> findEventsToEnd(@Param("now") LocalDateTime now);

    boolean existsBySlug(String slug);
}
