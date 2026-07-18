package com.auction.account.controller;

import com.auction.account.dao.UserRepository;
import com.auction.account.dto.ChangePasswordRequest;
import com.auction.account.dto.CheckPhoneVerificationRequest;
import com.auction.account.dto.SendPhoneVerificationRequest;
import com.auction.account.dto.UpdateProfileRequest;
import com.auction.account.dto.UserProfileResponse;
import com.auction.account.entity.User;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.util.PasswordUtil;
import com.auction.account.service.PhoneOtpService;
import com.auction.common.dto.ApiResponse;
import com.auction.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final PhoneOtpService phoneOtpService;

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
        user = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", toResponse(user)));
    }

    @PostMapping("/phone-verification/send")
    @Transactional
    public ResponseEntity<ApiResponse<UserProfileResponse>> sendPhoneVerification(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody SendPhoneVerificationRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        try {
            String phone = phoneOtpService.normalizePhone(request.getPhone());
            User user = userRepository.findById(Math.toIntExact(principal.getId()))
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            int currentUserId = user.getId();
            boolean usedByAnotherAccount = userRepository.findByPhone(phone)
                    .map(existing -> existing.getId() != currentUserId)
                    .orElse(false);
            if (usedByAnotherAccount) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("Số điện thoại đã được sử dụng bởi tài khoản khác."));
            }

            phoneOtpService.startVerification(user, phone, request.getChannel());
            user.setPhone(phone);
            user.setPhoneVerified(false);
            user.setPhoneVerifiedAt(null);
            user.setProfileStatus("PENDING_PHONE_VERIFY");
            user = userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success(
                    "Mã OTP đã được gửi. Mã có hiệu lực theo cấu hình của dịch vụ.",
                    toResponse(user)
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error(ex.getMessage()));
        }
    }

    @PostMapping("/phone-verification/check")
    @Transactional
    public ResponseEntity<ApiResponse<UserProfileResponse>> checkPhoneVerification(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @Valid @RequestBody CheckPhoneVerificationRequest request
    ) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        User user = userRepository.findById(Math.toIntExact(principal.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getPhone() == null || user.getPhone().isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng gửi mã OTP trước."));
        }
        try {
            if (!phoneOtpService.checkVerification(user, user.getPhone(), request.getCode())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Mã OTP không đúng hoặc đã hết hạn."));
            }
            user.setPhoneVerified(true);
            user.setPhoneVerifiedAt(LocalDateTime.now());
            if (!user.isIdentityVerified()) {
                user.setProfileStatus("PENDING_IDENTITY_VERIFY");
            }
            user = userRepository.save(user);
            return ResponseEntity.ok(ApiResponse.success(
                    "Số điện thoại đã được xác minh.",
                    toResponse(user)
            ));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error(ex.getMessage()));
        }
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
                .emailVerified(u.isEmailVerified())
                .phone(u.getPhone())
                .phoneVerified(u.isPhoneVerified())
                .phoneVerifiedAt(u.getPhoneVerifiedAt())
                .identityNumber(com.auction.common.util.SensitiveDataMasker.maskCccd(u.getIdentityNumber()))
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
