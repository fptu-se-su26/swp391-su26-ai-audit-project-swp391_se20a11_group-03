package com.auction.account.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.ToString;

@Data
public class LoginRequest {

    @JsonProperty("usernameOrEmail")
    private String usernameOrEmail;

    @ToString.Exclude
    private String password;
}

