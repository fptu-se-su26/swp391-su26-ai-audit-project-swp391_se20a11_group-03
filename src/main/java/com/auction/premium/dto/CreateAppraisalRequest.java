package com.auction.premium.dto;

import jakarta.validation.constraints.NotNull;
public record CreateAppraisalRequest(@NotNull Long productId) {}
