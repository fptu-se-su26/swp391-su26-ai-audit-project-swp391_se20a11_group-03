package com.auction.bidding.repository;

import com.auction.bidding.entity.AuctionChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuctionChatMessageRepository extends JpaRepository<AuctionChatMessage, Long> {

    List<AuctionChatMessage> findByAuctionIdOrderBySentAtAsc(Long auctionId);
}
