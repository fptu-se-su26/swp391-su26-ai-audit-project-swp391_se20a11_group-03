package com.auction.bidding.repository;

import com.auction.bidding.entity.AuctionSession;

import java.util.List;
import java.util.Optional;

public interface AuctionSessionRepository {
    Optional<AuctionSession> findByIdForUpdate(Long auctionId);
    Optional<AuctionSession> findById(Long auctionId);
    List<AuctionSession> findOpenRooms();
    List<AuctionSession> findByCurrentWinnerUserId(Integer userId);
    AuctionSession save(AuctionSession auctionSession);
}

