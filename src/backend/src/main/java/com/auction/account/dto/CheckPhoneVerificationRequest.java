package com.auction.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CheckPhoneVerificationRequest {
    @NotBlank
    @Pattern(regexp = "\\d{4,10}", message = "Mã OTP phải gồm từ 4 đến 10 chữ số")
    private String code;
}
