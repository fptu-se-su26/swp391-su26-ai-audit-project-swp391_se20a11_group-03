package com.auction.account.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CccdDuplicateInfo {
    private Long userId;
    private String email;
    private String fullName;
    private String kycStatus;
    private Boolean identityVerified;
}
