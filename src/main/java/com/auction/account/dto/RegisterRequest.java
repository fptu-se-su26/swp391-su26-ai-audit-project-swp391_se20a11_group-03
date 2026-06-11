package com.auction.account.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String email;
    private String phone;

    @JsonAlias("identity")
    private String identityNumber;

    private String password;
    private String confirmPassword;
}
