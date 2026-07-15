package com.auction.account.controller;

import com.auction.account.dao.UserRepository;
import com.auction.account.dto.ChangePasswordRequest;
import com.auction.account.dto.UpdateProfileRequest;
import com.auction.account.dto.UserProfileResponse;
import com.auction.account.entity.User;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.util.PasswordUtil;
import com.auction.common.dto.ApiResponse;
import com.auction.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @AuthenticationPrincipal UserDetailsImpl principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        User user = userRepository.findById(Math.toIntExact(principal.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(ApiResponse.success("OK", toResponse(user)));
    }

    @PutMapping("/profile")
    @Transactional
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        User user = userRepository.findById(Math.toIntExact(principal.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setFullName(request.getFullName().trim());
        user.setPhone(request.getPhone().trim());
        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", toResponse(user)));
    }

    @PostMapping("/change-password")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mật khẩu xác nhận không khớp."));
        }
        if (!isStrongPassword(request.getNewPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số."));
        }

        User user = userRepository.findById(Math.toIntExact(principal.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!currentPasswordMatches(request.getCurrentPassword(), user)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mật khẩu hiện tại không đúng."));
        }

        String salt = PasswordUtil.generateSalt();
        int iterations = PasswordUtil.getIterations();
        user.setSalt(salt);
        user.setPasswordIterations(iterations);
        user.setPasswordHash(PasswordUtil.hashPassword(request.getNewPassword(), salt, iterations));
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công.", null));
    }

    private boolean currentPasswordMatches(String rawPassword, User user) {
        String storedHash = user.getPasswordHash();
        if (storedHash == null) {
            return false;
        }
        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedHash);
        }
        return PasswordUtil.matches(rawPassword, user.getSalt(), storedHash, user.getPasswordIterations());
    }

    private boolean isStrongPassword(String password) {
        return password.length() >= 8
                && password.chars().anyMatch(Character::isUpperCase)
                && password.chars().anyMatch(Character::isLowerCase)
                && password.chars().anyMatch(Character::isDigit);
    }

    private UserProfileResponse toResponse(User u) {
        return UserProfileResponse.builder()
                .userId((long) u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .identityNumber(u.getIdentityNumber())
                .roleName(u.getRole() != null ? u.getRole().getRoleName() : "User")
                .status(u.getStatus())
                .identityVerified(u.isIdentityVerified())
                .profileStatus(u.getProfileStatus())
                .identityVerifiedAt(u.getIdentityVerifiedAt())
                .active(u.isActive())
                .paymentStrikeCount(u.getPaymentStrikeCount())
                .lockedByPaymentStrikes(u.isLockedByPaymentStrikes())
                .build();
    }
}
