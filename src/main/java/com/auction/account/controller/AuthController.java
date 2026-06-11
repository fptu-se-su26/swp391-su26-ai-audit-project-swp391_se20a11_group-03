package com.auction.account.controller;

import com.auction.account.dto.LoginRequest;
import com.auction.account.dto.LoginResponse;
import com.auction.account.dto.RegisterRequest;
import com.auction.account.dto.RegisterResponse;
import com.auction.account.entity.User;
import com.auction.account.service.AuthService;
import com.auction.account.service.ChatAuthService;
import com.auction.common.service.AuthAuditService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final ChatAuthService chatAuthService;
    private final AuthService registrationService;
    private final AuthAuditService authAuditService;

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(chatAuthService.login(request));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<RegisterResponse> register(
            @RequestBody RegisterRequest request,
            HttpServletRequest servletRequest
    ) {
        AuthService.AuthResult result = registrationService.register(
                normalize(request.getFullName()),
                normalize(request.getEmail()),
                normalize(request.getPhone()),
                normalize(request.getIdentityNumber()),
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

        User createdUser = result.getUser();
        authAuditService.logRegisterSuccess(createdUser.getEmail(), servletRequest);

        return ResponseEntity.status(HttpStatus.CREATED).body(RegisterResponse.builder()
                .success(true)
                .message(result.getMessage())
                .userId(createdUser.getUserId())
                .fullName(createdUser.getFullName())
                .email(createdUser.getEmail())
                .status(createdUser.getStatus())
                .build());
    }

    @GetMapping("/alive")
    public ResponseEntity<Map<String, String>> alive() {
        return ResponseEntity.ok(Map.of("status", "OK"));
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}

