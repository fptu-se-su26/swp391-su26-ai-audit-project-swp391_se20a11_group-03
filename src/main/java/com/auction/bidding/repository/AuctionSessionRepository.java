package com.auction.bidding.repository;

import com.auction.bidding.entity.AuctionSession;

import java.util.List;
import java.util.Optional;

public interface AuctionSessionRepository {
    Optional<AuctionSession> findByIdForUpdate(Long auctionId);
    List<AuctionSession> findOpenRooms();
    AuctionSession save(AuctionSession auctionSession);
}

