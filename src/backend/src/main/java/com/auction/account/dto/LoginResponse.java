package com.auction.account.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LoginResponse {
    private Long userId;
    private String username;
    private String email;
    private String roleName;
    private String status;
    private String token;
    private boolean identityVerified;
    private boolean phoneVerified;
    private String profileStatus;

    /** True when this response created a brand-new account (e.g. first Google sign-in). */
    private boolean newUser;
}

