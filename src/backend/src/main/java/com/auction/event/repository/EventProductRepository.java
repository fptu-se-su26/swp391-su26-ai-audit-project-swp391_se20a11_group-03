package com.auction.event.repository;

import com.auction.event.entity.EventProduct;
import com.auction.event.enums.EventProductApprovalStatus;
import com.auction.event.enums.EventProductSessionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface EventProductRepository extends JpaRepository<EventProduct, Long> {
    List<EventProduct> findByEventId(Long eventId);

    /** Row-locked read used to serialize concurrent bid/purchase attempts on the same product. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ep FROM EventProduct ep WHERE ep.eventProductId = :eventProductId")
    Optional<EventProduct> findLockedById(@Param("eventProductId") Long eventProductId);

    List<EventProduct> findByEventIdAndApprovalStatus(Long eventId, EventProductApprovalStatus approvalStatus);

    List<EventProduct> findByEventIdAndSessionStatus(Long eventId, EventProductSessionStatus sessionStatus);

    List<EventProduct> findBySubmittedBySellerIdAndEventId(Long sellerId, Long eventId);

    Optional<EventProduct> findByEventIdAndProductId(Long eventId, Long productId);

    @Query("SELECT ep FROM EventProduct ep WHERE ep.eventId = :eventId AND ep.sessionStart <= :now AND ep.sessionEnd > :now AND ep.sessionStatus = 'SCHEDULED'")
    List<EventProduct> findSessionsToStart(@Param("eventId") Long eventId, @Param("now") LocalDateTime now);

    @Query("SELECT ep FROM EventProduct ep WHERE ep.eventId = :eventId AND ep.sessionEnd <= :now AND ep.sessionStatus = 'ACTIVE'")
    List<EventProduct> findSessionsToEnd(@Param("eventId") Long eventId, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(ep) FROM EventProduct ep WHERE ep.eventId = :eventId AND ep.approvalStatus = :status")
    Long countByEventIdAndApprovalStatus(@Param("eventId") Long eventId, @Param("status") EventProductApprovalStatus status);

    @Query("SELECT COUNT(ep) FROM EventProduct ep WHERE ep.eventId = :eventId AND ep.sessionStatus = :status")
    Long countByEventIdAndSessionStatus(@Param("eventId") Long eventId, @Param("status") EventProductSessionStatus status);

    boolean existsByProductIdAndApprovalStatusNot(Long productId, EventProductApprovalStatus approvalStatus);
}
