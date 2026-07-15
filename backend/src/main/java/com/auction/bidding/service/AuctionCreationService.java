package com.auction.bidding.service;

import com.auction.bidding.entity.Auction;
import com.auction.bidding.entity.AuctionMode;

import java.time.LocalDateTime;

public interface AuctionCreationService {
    /**
     * Create a new Auction row for a product that has just been approved.
     *
     * @param productId              product that was approved
     * @param mode                    LIVE (3-minute countdown) or TIMED (6-12h)
     * @param startTime              when the auction will open
     * @param scheduledDurationSeconds only used for TIMED; ignored for LIVE
     * @return persisted Auction (status = UPCOMING)
     */
    Auction createForApprovedProduct(Long productId, AuctionMode mode, LocalDateTime startTime, Long scheduledDurationSeconds);
}
