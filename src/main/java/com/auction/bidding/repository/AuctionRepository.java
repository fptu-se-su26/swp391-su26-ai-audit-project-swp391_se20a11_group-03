package com.auction.bidding.repository;

import com.auction.bidding.entity.Auction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long> {
    Optional<Auction> findByProduct_ProductId(Long productId);
    @Query("SELECT a FROM Auction a JOIN FETCH a.product WHERE a.product.productId IN :productIds")
    List<Auction> findByProduct_ProductIdIn(@Param("productIds") List<Long> productIds);

    @Modifying
    @Query("UPDATE Auction a SET a.status = 'ENDED' " +
            "WHERE a.endTime < :now AND a.status IN ('UPCOMING', 'ACTIVE')")
    int markExpiredAsEnded(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Auction a SET a.status = 'ACTIVE' " +
            "WHERE a.startTime <= :now AND a.endTime > :now AND a.status = 'UPCOMING'")
    int markStartedAsActive(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE Auction a SET a.status = 'UPCOMING' " +
            "WHERE a.startTime > :now AND a.status NOT IN ('UPCOMING', 'CANCELED')")
    int markFutureAsUpcoming(@Param("now") LocalDateTime now);
}

