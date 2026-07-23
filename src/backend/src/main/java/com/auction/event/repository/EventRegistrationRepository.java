package com.auction.event.repository;

import com.auction.event.entity.EventRegistration;
import com.auction.event.enums.EventRegistrationRole;
import com.auction.event.enums.EventRegistrationStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {
    Optional<EventRegistration> findByEventIdAndUserId(Long eventId, Long userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from EventRegistration r where r.eventId = :eventId and r.userId = :userId")
    Optional<EventRegistration> findLockedByEventIdAndUserId(
            @Param("eventId") Long eventId,
            @Param("userId") Long userId
    );

    List<EventRegistration> findByEventId(Long eventId);

    List<EventRegistration> findByEventIdAndRole(Long eventId, EventRegistrationRole role);

    List<EventRegistration> findByEventIdAndStatus(Long eventId, EventRegistrationStatus status);

    List<EventRegistration> findByUserIdAndStatus(Long userId, EventRegistrationStatus status);

    boolean existsByEventIdAndUserId(Long eventId, Long userId);

    @Query("SELECT COUNT(r) FROM EventRegistration r WHERE r.eventId = :eventId AND r.role = :role AND r.status = 'REGISTERED'")
    Long countByEventIdAndRole(@Param("eventId") Long eventId, @Param("role") EventRegistrationRole role);
}
