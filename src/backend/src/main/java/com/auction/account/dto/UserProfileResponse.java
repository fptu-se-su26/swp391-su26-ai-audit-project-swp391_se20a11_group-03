package com.auction.account.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Long userId;
    private String fullName;
    private String email;
    private boolean emailVerified;
    private String phone;
    private boolean phoneVerified;
    private LocalDateTime phoneVerifiedAt;
    private String identityNumber;
    private String roleName;
    private String status;
    private boolean identityVerified;
    private String profileStatus;
    private LocalDateTime identityVerifiedAt;
    private boolean active;
    private int paymentStrikeCount;
    private boolean lockedByPaymentStrikes;
}
