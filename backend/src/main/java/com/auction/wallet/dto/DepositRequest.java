package com.auction.wallet.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DepositRequest {
    @NotNull
    @Min(1000)
    private Long amount;
}
