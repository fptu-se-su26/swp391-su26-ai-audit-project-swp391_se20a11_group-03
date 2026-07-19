package com.auction.premium.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
public record UpdateAppraisalRequest(@NotNull @Positive Long recommendedPrice,
                                     @Size(max = 1000) String expertNote) {}
