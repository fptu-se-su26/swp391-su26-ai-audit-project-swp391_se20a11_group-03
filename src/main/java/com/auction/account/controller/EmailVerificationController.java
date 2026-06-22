package com.auction.account.controller;

import com.auction.account.entity.User;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.service.EmailVerificationService;
import com.auction.account.service.ProfileService;
import com.auction.common.util.AuditLogUtil;
import com.auction.common.util.TokenUtil;
import com.auction.config.AppConfig;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;
    private final ProfileService profileService;

    /**
     * POST /api/auth/send-verification-email
     * Yêu cầu JWT. Gửi email chứa link xác minh tới địa chỉ email của user.
     */
    @PostMapping("/send-verification-email")
    public ResponseEntity<Map<String, Object>> sendVerificationEmail(
            @AuthenticationPrincipal UserDetailsImpl principal,
            HttpServletRequest request) {

        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Chưa đăng nhập."));
        }

        User user = profileService.getUserById(principal.getId().intValue());
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy tài khoản."));
        }
        if (user.isEmailVerified()) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Email đã được xác minh trước đó."));
        }

        // Build base URL: scheme://host:port/contextPath/api/auth/verify-email
        String baseUrl = request.getScheme() + "://" + request.getServerName()
                + ":" + request.getServerPort()
                + request.getContextPath();
        String verifyBaseUrl = baseUrl + "/api/auth/verify-email";

        try {
            int validMinutes = AppConfig.getInt("vnec.email.token.validMinutes", 15);
            emailVerificationService.createAndSendToken(user, verifyBaseUrl, validMinutes);

            AuditLogUtil.authEvent("VERIFY_EMAIL", true, user.getEmail(),
                    "token_sent", request.getRemoteAddr(), request.getHeader("User-Agent"));

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Email xác minh đã được gửi. Vui lòng kiểm tra hộp thư."));
        } catch (Exception e) {
            AuditLogUtil.authEvent("VERIFY_EMAIL", false, user.getEmail(),
                    e.getMessage(), request.getRemoteAddr(), request.getHeader("User-Agent"));
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Không thể gửi email. Vui lòng thử lại sau."));
        }
    }

    /**
     * GET /api/auth/verify-email?token=xxx
     * Không cần JWT. User click link trong email → token được xác minh.
     */
    @GetMapping("/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(
            @RequestParam(name = "token", required = false) String rawToken,
            HttpServletRequest request) {

        if (rawToken == null || rawToken.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Token không hợp lệ."));
        }

        String tokenHash = TokenUtil.sha256(rawToken.trim());
        boolean verified = profileService.verifyEmailToken(tokenHash);

        if (verified) {
            AuditLogUtil.authEvent("VERIFY_EMAIL", true, "-",
                    "email_confirmed", request.getRemoteAddr(), request.getHeader("User-Agent"));
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Xác minh email thành công!"));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Token không hợp lệ, đã sử dụng hoặc đã hết hạn."));
        }
    }
}
