package com.auction.bidding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionEligibilityResponse {
    private Long auctionId;
    private Long productId;
    private boolean depositAllowed;
    private boolean alreadyDeposited;
    private Long depositAmount;
    private LocalDateTime startTime;
    private LocalDateTime depositDeadline;
    private String message;

    /** Whether the current user is identity-verified (KYC APPROVED). */
    private boolean kycVerified;

    /** Profile status (e.g. PENDING_IDENTITY_VERIFY, VERIFIED, KYC_REJECTED). */
    private String profileStatus;
}
