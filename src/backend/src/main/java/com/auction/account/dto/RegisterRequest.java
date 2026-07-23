package com.auction.account.dto;

import lombok.Data;
import lombok.ToString;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    @ToString.Exclude
    private String emailVerificationToken;
    @ToString.Exclude
    private String password;
    @ToString.Exclude
    private String confirmPassword;
}
