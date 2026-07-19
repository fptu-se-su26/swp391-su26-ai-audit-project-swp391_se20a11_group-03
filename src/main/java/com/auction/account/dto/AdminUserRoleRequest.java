package com.auction.account.dto;

import jakarta.validation.constraints.NotBlank;

public record AdminUserRoleRequest(
        @NotBlank String roleName
) {
}
