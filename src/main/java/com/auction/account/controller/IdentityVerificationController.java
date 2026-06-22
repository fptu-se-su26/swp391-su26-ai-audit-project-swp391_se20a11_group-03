package com.auction.account.controller;

import com.auction.account.entity.User;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.service.IdentityVerificationService;
import com.auction.account.service.ProfileService;
import com.auction.common.util.AuditLogUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class IdentityVerificationController {

    private final IdentityVerificationService identityVerificationService;
    private final ProfileService profileService;

    /**
     * POST /api/auth/verify-identity
     * Yêu cầu JWT. Nhận ảnh mặt trước + mặt sau CCCD, chạy OCR và lưu hồ sơ.
     *
     * Form fields:
     *   front_image  — file ảnh mặt trước CCCD (required)
     *   back_image   — file ảnh mặt sau CCCD (required)
     */
    @PostMapping(value = "/verify-identity", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> verifyIdentity(
            @AuthenticationPrincipal UserDetailsImpl principal,
            @RequestPart("front_image") MultipartFile frontImage,
            @RequestPart("back_image") MultipartFile backImage,
            HttpServletRequest request) {

        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Chưa đăng nhập."));
        }

        User user = profileService.getUserById(principal.getId().intValue());
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy tài khoản."));
        }
        if (user.isIdentityVerified()) {
            return ResponseEntity.ok(Map.of("success", true, "message", "CCCD đã được xác minh trước đó."));
        }

        // Validate files
        if (frontImage == null || frontImage.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Vui lòng tải lên ảnh mặt trước CCCD."));
        }
        if (backImage == null || backImage.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Vui lòng tải lên ảnh mặt sau CCCD."));
        }

        try {
            byte[] frontBytes = frontImage.getBytes();
            byte[] backBytes  = backImage.getBytes();

            IdentityVerificationService.VerificationDecision decision =
                    identityVerificationService.submitDocument(
                            user,
                            "CCCD",
                            user.getIdentityNumber(),
                            user.getFullName(),
                            null,
                            frontBytes,
                            backBytes,
                            frontImage.getOriginalFilename(),
                            backImage.getOriginalFilename()
                    );

            AuditLogUtil.authEvent("VERIFY_IDENTITY",
                    decision.approved(),
                    user.getEmail(),
                    decision.approved() ? "auto_approved" : "pending_review",
                    request.getRemoteAddr(),
                    request.getHeader("User-Agent"));

            if (decision.approved()) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "approved", true,
                        "message", decision.message()));
            } else {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "approved", false,
                        "message", decision.message()));
            }

        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Không thể đọc file ảnh. Vui lòng thử lại."));
        } catch (Exception e) {
            AuditLogUtil.authEvent("VERIFY_IDENTITY", false, principal.getUsername(),
                    e.getMessage(), request.getRemoteAddr(), request.getHeader("User-Agent"));
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Lỗi xử lý hồ sơ. Vui lòng thử lại sau."));
        }
    }

    /**
     * GET /api/auth/kyc-status
     * Yêu cầu JWT. Trả về trạng thái xác minh CCCD hiện tại của user.
     */
    @GetMapping("/kyc-status")
    public ResponseEntity<Map<String, Object>> getKycStatus(
            @AuthenticationPrincipal UserDetailsImpl principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Chưa đăng nhập."));
        }

        User user = profileService.getUserById(principal.getId().intValue());
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy tài khoản."));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "emailVerified", user.isEmailVerified(),
                "identityVerified", user.isIdentityVerified(),
                "verificationLevel", user.getVerificationLevel(),
                "profileStatus", user.getProfileStatus() != null ? user.getProfileStatus() : "PENDING_PROFILE"
        ));
    }
}
