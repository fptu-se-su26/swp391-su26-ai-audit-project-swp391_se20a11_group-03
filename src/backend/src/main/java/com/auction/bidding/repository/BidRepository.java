package com.auction.bidding.repository;

import com.auction.bidding.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.time.LocalDateTime;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuctionIdOrderByBidAmountDesc(Long auctionId);
    List<Bid> findByUserId(Integer userId);
    List<Bid> findTop20ByAuctionIdOrderByBidTimeDesc(Long auctionId);
    List<Bid> findByAuctionIdAndBidTimeAfterOrderByBidTimeAsc(Long auctionId, LocalDateTime after);
    List<Bid> findByUserIdAndBidTimeAfter(Long userId, LocalDateTime after);

    @Query("""
            select count(distinct b.userId)
            from Bid b
            where b.auctionId = :auctionId
              and b.ipAddress = :ipAddress
              and b.bidTime >= :after
            """)
    long countDistinctUsersByAuctionAndIpSince(
            @Param("auctionId") Long auctionId,
            @Param("ipAddress") String ipAddress,
            @Param("after") LocalDateTime after);

    @Query("""
            select count(distinct b.userId)
            from Bid b
            where b.auctionId = :auctionId
              and b.deviceHash = :deviceHash
            """)
    long countDistinctUsersByAuctionAndDevice(
            @Param("auctionId") Long auctionId,
            @Param("deviceHash") String deviceHash);

    long countByUserIdAndDeviceHash(Long userId, String deviceHash);
    long countByUserIdAndIpAddress(Long userId, String ipAddress);

    @Query("""
            select count(distinct b.auctionId)
            from Bid b, AuctionSession a, Product p
            where b.userId = :userId
              and b.auctionId = a.auctionId
              and a.productId = p.productId
              and p.sellerId = :sellerId
            """)
    long countDistinctAuctionsBidByUserForSeller(
            @Param("userId") Long userId,
            @Param("sellerId") Long sellerId);

    @Query("""
            select b.auctionId, count(b)
            from Bid b
            where b.auctionId in :auctionIds
            group by b.auctionId
            """)
    List<Object[]> countByAuctionIds(@Param("auctionIds") List<Long> auctionIds);
}

