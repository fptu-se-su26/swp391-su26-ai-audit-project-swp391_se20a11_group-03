package com.auction.account.dto;

import com.auction.account.entity.User;

public record AdminUserResponse(
        Integer userId,
        String fullName,
        String email,
        String phone,
        String identityNumber,
        String roleName,
        String status,
        String profileStatus,
        boolean active,
        boolean emailVerified,
        boolean identityVerified
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getIdentityNumber(),
                user.getRole().getRoleName(),
                user.getStatus(),
                user.getProfileStatus(),
                user.isActive(),
                user.isEmailVerified(),
                user.isIdentityVerified()
        );
    }
}
