package com.auction.account.controller;

import com.auction.account.dao.UserDAO;
import com.auction.account.dto.GoogleLoginRequest;
import com.auction.account.dto.LoginRequest;
import com.auction.account.dto.LoginResponse;
import com.auction.account.dto.RegisterRequest;
import com.auction.account.dto.RegisterResponse;
import com.auction.account.dto.SendRegistrationEmailCodeRequest;
import com.auction.account.dto.VerifyRegistrationEmailCodeRequest;
import com.auction.account.entity.User;
import com.auction.account.service.AuthService;
import com.auction.account.service.ChatAuthService;
import com.auction.account.service.EmailVerificationService;
import com.auction.account.service.GoogleAuthService;
import com.auction.account.service.RegistrationEmailVerificationService;
import com.auction.common.service.AuthAuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final ChatAuthService chatAuthService;
    private final AuthService registrationService;
    private final GoogleAuthService googleAuthService;
    private final EmailVerificationService emailVerificationService;
    private final RegistrationEmailVerificationService registrationEmailVerificationService;
    private final AuthAuditService authAuditService;
    private final UserDAO userDAO;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(chatAuthService.login(request));
    }

    @PostMapping("/auth/google")
    public ResponseEntity<LoginResponse> googleLogin(
            @RequestBody GoogleLoginRequest request,
            HttpServletRequest servletRequest
    ) {
        LoginResponse response = googleAuthService.loginWithGoogle(request.getCredential());
        if (response.isNewUser()) {
            authAuditService.logRegisterSuccess(response.getEmail(), servletRequest);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/register")
    public ResponseEntity<RegisterResponse> register(
            @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest
    ) {
        AuthService.AuthResult result = registrationService.register(
                normalize(request.getFullName()),
                normalize(request.getEmail()),
                request.getPassword(),
                request.getConfirmPassword()
        );

        if (!result.isSuccess()) {
            authAuditService.logRegisterFailure(request.getEmail(), result.getMessage(), servletRequest);
            return ResponseEntity.badRequest().body(RegisterResponse.builder()
                    .success(false)
                    .message(result.getMessage())
                    .build());
        }

        // Account starts unverified; login stays blocked until the activation
        // link in the email is clicked (GET /auth/verify-email).
        User createdUser = result.getUser();
        try {
            emailVerificationService.createAndSendToken(
                    createdUser,
                    frontendBaseUrl + "/auth/verify-email",
                    30
            );
        } catch (RuntimeException ex) {
            authAuditService.logRegisterSuccess(createdUser.getEmail(), servletRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(RegisterResponse.builder()
                    .success(true)
                    .message("Tạo tài khoản thành công nhưng chưa gửi được email kích hoạt. "
                            + "Hãy dùng nút \"Gửi lại\" ở màn hình đăng nhập.")
                    .userId(createdUser.getUserId())
                    .fullName(createdUser.getFullName())
                    .email(createdUser.getEmail())
                    .status(createdUser.getStatus())
                    .build());
        }
        authAuditService.logRegisterSuccess(createdUser.getEmail(), servletRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body(RegisterResponse.builder()
                .success(true)
                .message("Tạo tài khoản thành công! Vui lòng mở email và nhấn liên kết kích hoạt "
                        + "(hiệu lực 30 phút) trước khi đăng nhập.")
                .userId(createdUser.getUserId())
                .fullName(createdUser.getFullName())
                .email(createdUser.getEmail())
                .status(createdUser.getStatus())
                .build());
    }

    @PostMapping("/auth/register/email/send-code")
    public ResponseEntity<Map<String, Object>> sendRegistrationEmailCode(
            @Valid @RequestBody SendRegistrationEmailCodeRequest request
    ) {
        try {
            registrationEmailVerificationService.sendCode(request.getEmail());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Mã xác thực đã được gửi tới email của bạn."
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
            ));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                    "success", false,
                    "message", "Không thể gửi email lúc này. Vui lòng kiểm tra cấu hình SMTP hoặc thử lại sau."
            ));
        }
    }

    @PostMapping("/auth/register/email/verify-code")
    public ResponseEntity<Map<String, Object>> verifyRegistrationEmailCode(
            @Valid @RequestBody VerifyRegistrationEmailCodeRequest request
    ) {
        try {
            String registrationToken = registrationEmailVerificationService.verifyCode(
                    request.getEmail(),
                    request.getCode()
            );
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Email đã được xác thực.",
                    "registrationToken", registrationToken
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
            ));
        }
    }

    @GetMapping("/auth/verify-email")
    public ResponseEntity<Map<String, Object>> verifyEmail(@RequestParam("token") String token) {
        boolean verified = emailVerificationService.verifyToken(token);
        if (!verified) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Liên kết xác minh không hợp lệ hoặc đã hết hạn."
            ));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Email đã được xác minh. Bạn có thể đăng nhập."
        ));
    }

    @PostMapping("/auth/email-verification/resend")
    public ResponseEntity<Map<String, Object>> resendEmailVerification(
            @RequestBody Map<String, String> payload
    ) {
        String email = normalize(payload.get("email"));
        User user = email == null ? null : userDAO.findByEmail(email);
        if (user != null && !user.isEmailVerified()) {
            String verifyBaseUrl = frontendBaseUrl + "/auth/verify-email";
            try {
                emailVerificationService.createAndSendToken(user, verifyBaseUrl, 30);
            } catch (RuntimeException ex) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                        "success", false,
                        "message", "Dịch vụ email chưa sẵn sàng. Vui lòng thử lại sau."
                ));
            }
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Nếu email tồn tại và chưa được xác minh, hệ thống đã gửi một liên kết mới."
        ));
    }

    @GetMapping("/alive")
    public ResponseEntity<Map<String, String>> alive() {
        return ResponseEntity.ok(Map.of("status", "OK"));
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}

