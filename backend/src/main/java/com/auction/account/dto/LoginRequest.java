package com.auction.account.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class LoginRequest {

    @JsonProperty("usernameOrEmail")
    private String usernameOrEmail;

    private String password;
}

