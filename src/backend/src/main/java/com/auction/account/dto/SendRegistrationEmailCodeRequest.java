package com.auction.account.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendRegistrationEmailCodeRequest {
    @NotBlank
    @Email
    private String email;
}
