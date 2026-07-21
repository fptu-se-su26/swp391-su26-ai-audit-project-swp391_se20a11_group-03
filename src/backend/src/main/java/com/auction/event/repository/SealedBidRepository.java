package com.auction.event.repository;

import com.auction.event.entity.SealedBid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SealedBidRepository extends JpaRepository<SealedBid, Long> {
    Optional<SealedBid> findByEventProductIdAndUserId(Long eventProductId, Long userId);

    List<SealedBid> findByEventProductId(Long eventProductId);

    @Query("SELECT sb FROM SealedBid sb WHERE sb.eventProductId = :eventProductId AND sb.revealed = false")
    List<SealedBid> findUnrevealedByEventProductId(@Param("eventProductId") Long eventProductId);

    @Query("SELECT sb FROM SealedBid sb WHERE sb.eventProductId = :eventProductId ORDER BY sb.bidAmount DESC, sb.submittedAt ASC")
    List<SealedBid> findByEventProductIdOrderByBidAmountDesc(@Param("eventProductId") Long eventProductId);
}
