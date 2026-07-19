package com.auction.account.dto;

import lombok.Data;

@Data
public class GoogleLoginRequest {

    /** The Google ID token (JWT credential) returned by Google Identity Services. */
    private String credential;
}
