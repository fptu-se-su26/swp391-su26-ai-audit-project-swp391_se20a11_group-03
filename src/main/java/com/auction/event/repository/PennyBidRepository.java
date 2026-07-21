package com.auction.event.repository;

import com.auction.event.entity.PennyBid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PennyBidRepository extends JpaRepository<PennyBid, Long> {
    List<PennyBid> findByEventProductIdOrderByBidAtDesc(Long eventProductId);

    List<PennyBid> findByEventProductId(Long eventProductId);

    @Query("SELECT pb FROM PennyBid pb WHERE pb.eventProductId = :eventProductId ORDER BY pb.bidAt DESC")
    Optional<PennyBid> findLastBidByEventProductId(@Param("eventProductId") Long eventProductId);

    @Query("SELECT COUNT(pb) FROM PennyBid pb WHERE pb.eventProductId = :eventProductId AND pb.userId = :userId")
    Long countByEventProductIdAndUserId(@Param("eventProductId") Long eventProductId, @Param("userId") Long userId);
}
