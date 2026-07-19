package com.auction.premium.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
public record UpsertAutoBidRequest(@NotNull Long auctionId, @NotNull @Positive Long maxPrice, boolean active) {}
