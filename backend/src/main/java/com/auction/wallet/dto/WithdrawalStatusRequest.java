package com.auction.wallet.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WithdrawalStatusRequest {
    @NotBlank
    private String status;

    private String staffNote;
}
