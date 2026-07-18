package com.auction.account.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String emailVerificationToken;
    private String password;
    private String confirmPassword;
}
