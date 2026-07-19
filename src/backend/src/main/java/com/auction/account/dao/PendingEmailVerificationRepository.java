package com.auction.account.dao;

import com.auction.account.entity.PendingEmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PendingEmailVerificationRepository
        extends JpaRepository<PendingEmailVerification, Long> {

    boolean existsByEmailIgnoreCaseAndCreatedAtAfter(String email, LocalDateTime createdAt);

    Optional<PendingEmailVerification>
    findTopByEmailIgnoreCaseAndConsumedAtIsNullOrderByCreatedAtDesc(String email);

    Optional<PendingEmailVerification>
    findTopByRegistrationTokenHashAndConsumedAtIsNullOrderByCreatedAtDesc(String tokenHash);
}
