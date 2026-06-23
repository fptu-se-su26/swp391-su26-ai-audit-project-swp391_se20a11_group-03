package com.auction.account.dto;

import com.auction.account.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String identityNumber;
    private String roleName;
    private String status;
    private String profileStatus;
    private boolean active;
    private boolean emailVerified;
    private boolean identityVerified;

    public static AdminUserDTO from(User user) {
        return new AdminUserDTO(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getIdentityNumber(),
                user.getRole() != null ? user.getRole().getRoleName() : null,
                user.getStatus(),
                user.getProfileStatus(),
                user.isActive(),
                user.isEmailVerified(),
                user.isIdentityVerified()
        );
    }
}
