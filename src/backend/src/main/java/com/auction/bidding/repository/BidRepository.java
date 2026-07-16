package com.auction.bidding.repository;

import com.auction.bidding.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    List<Bid> findByAuctionIdOrderByBidAmountDesc(Long auctionId);
    List<Bid> findByUserId(Integer userId);

    @Query("""
            select b.auctionId, count(b)
            from Bid b
            where b.auctionId in :auctionIds
            group by b.auctionId
            """)
    List<Object[]> countByAuctionIds(@Param("auctionIds") List<Long> auctionIds);
}

