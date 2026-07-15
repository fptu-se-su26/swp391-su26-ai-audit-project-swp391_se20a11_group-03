package com.auction.bidding.service.impl;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.bidding.entity.Auction;
import com.auction.bidding.dto.AuctionEligibilityResponse;
import com.auction.bidding.util.DepositCalculator;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.service.AuctionService;
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
    private final UserRepository userRepository;

    @Override
    public AuctionEligibilityResponse getEligibility(Long auctionId, Long userId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        LocalDateTime deadline = auction.getStartTime().minusMinutes(3);
        boolean allowed = LocalDateTime.now().isBefore(deadline);
        long depositAmount = DepositCalculator.calculate(auction.getProduct().getStartingPrice());
        boolean alreadyDeposited = userId != null && auctionDepositRepository
                .findByAuction_AuctionIdAndUser_Id(auctionId, Math.toIntExact(userId))
                .isPresent();
        boolean ownsProduct = userId != null
                && auction.getProduct() != null
                && auction.getProduct().getSellerId() != null
                && auction.getProduct().getSellerId().equals(userId);

        // KYC state for the current viewer (null if anonymous)
        boolean kycVerified = false;
        String profileStatus = null;
        if (userId != null) {
            User u = userRepository.findById(Math.toIntExact(userId)).orElse(null);
            if (u != null) {
                kycVerified = u.isIdentityVerified();
                profileStatus = u.getProfileStatus();
            }
        }

        String message;
        if (ownsProduct) {
            allowed = false;
            message = "Người bán chỉ có thể theo dõi, không thể đặt cọc cho phiên của chính mình.";
        } else if (alreadyDeposited) {
            allowed = false;
            message = "User already deposited for this auction.";
        } else if (!allowed) {
            message = "Deposit/registration is locked because the 3-minute cutoff has passed.";
        } else {
            message = "User can still deposit before the 3-minute cutoff.";
        }

        return AuctionEligibilityResponse.builder()
                .auctionId(auction.getAuctionId())
                .productId(auction.getProduct() != null ? auction.getProduct().getProductId() : null)
                .depositAllowed(allowed)
                .alreadyDeposited(alreadyDeposited)
                .depositAmount(depositAmount)
                .startTime(auction.getStartTime())
                .depositDeadline(deadline)
                .message(message)
                .kycVerified(kycVerified)
                .profileStatus(profileStatus)
                .build();
    }
}
