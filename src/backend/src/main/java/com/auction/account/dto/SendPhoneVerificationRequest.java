package com.auction.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SendPhoneVerificationRequest {
    @NotBlank
    private String phone;

    @NotBlank
    @Pattern(regexp = "(?i)SMS|WHATSAPP", message = "Kênh xác minh phải là SMS hoặc WHATSAPP")
    private String channel;
}
