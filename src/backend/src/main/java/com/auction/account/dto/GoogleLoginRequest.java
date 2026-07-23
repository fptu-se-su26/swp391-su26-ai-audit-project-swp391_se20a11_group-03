package com.auction.account.dto;

import lombok.Data;
import lombok.ToString;

@Data
public class GoogleLoginRequest {

    /** The Google ID token (JWT credential) returned by Google Identity Services. */
    @ToString.Exclude
    private String credential;
}
