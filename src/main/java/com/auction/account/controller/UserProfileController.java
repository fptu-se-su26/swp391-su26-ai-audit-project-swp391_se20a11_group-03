package com.auction.account.controller;

import com.auction.account.dao.UserRepository;
import com.auction.account.dto.UpdateProfileRequest;
import com.auction.account.dto.UserProfileResponse;
import com.auction.account.entity.User;
import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.common.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserRepository userRepository;

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
                .build();
    }
}
