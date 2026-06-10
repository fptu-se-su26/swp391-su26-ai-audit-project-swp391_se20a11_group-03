package com.auction.chat.dto;

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
}

