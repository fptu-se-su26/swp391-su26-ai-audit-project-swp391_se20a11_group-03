package com.hoangxuananhtuan.auction.service.impl;

import com.hoangxuananhtuan.auction.domain.Auction;
import com.hoangxuananhtuan.auction.dto.AuctionEligibilityResponse;
import com.hoangxuananhtuan.auction.exception.ResourceNotFoundException;
import com.hoangxuananhtuan.auction.repository.AuctionDepositRepository;
import com.hoangxuananhtuan.auction.repository.AuctionRepository;
import com.hoangxuananhtuan.auction.service.AuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuctionServiceImpl implements AuctionService {

    private final AuctionRepository auctionRepository;
    private final AuctionDepositRepository auctionDepositRepository;

    @Override
    public AuctionEligibilityResponse getEligibility(Long auctionId, Long userId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        LocalDateTime deadline = auction.getStartTime().minusMinutes(30);
        boolean allowed = LocalDateTime.now().isBefore(deadline);
        boolean alreadyDeposited = userId != null && auctionDepositRepository
                .findByAuction_AuctionIdAndUser_UserId(auctionId, userId)
                .isPresent();

        String message;
        if (alreadyDeposited) {
            allowed = false;
            message = "User already deposited for this auction.";
        } else if (!allowed) {
            message = "Deposit/registration is locked because the 30-minute cutoff has passed.";
        } else {
            message = "User can still deposit before the 30-minute cutoff.";
        }

        return AuctionEligibilityResponse.builder()
                .auctionId(auction.getAuctionId())
                .productId(auction.getProduct() != null ? auction.getProduct().getProductId() : null)
                .depositAllowed(allowed)
                .startTime(auction.getStartTime())
                .depositDeadline(deadline)
                .message(message)
                .build();
    }
}
