package com.auction.account.controller;

import com.auction.account.dao.UserDAO;
import com.auction.account.dto.LoginRequest;
import com.auction.account.dto.LoginResponse;
import com.auction.account.dto.RegisterRequest;
import com.auction.account.dto.RegisterResponse;
import com.auction.account.entity.Role;
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
    private final UserDAO userDAO;

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

    @PostMapping("/auth/select-role")
    public ResponseEntity<?> selectRole(@RequestBody Map<String, Object> payload, HttpServletRequest servletRequest) {
        Object userIdRaw = payload.get("userId");
        Object roleRaw = payload.get("role");
        if (userIdRaw == null || roleRaw == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Thiếu userId hoặc role."
            ));
        }

        int userId;
        try {
            userId = Integer.parseInt(String.valueOf(userIdRaw));
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "userId không hợp lệ."
            ));
        }

        String requestedRole = String.valueOf(roleRaw).trim();
        String dbRoleName;
        switch (requestedRole.toUpperCase()) {
            case "SELLER":
                dbRoleName = "Seller";
                break;
            case "BUYER":
            case "USER":
                dbRoleName = "User";
                break;
            default:
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Role không hợp lệ. Chỉ chấp nhận BUYER hoặc SELLER."
                ));
        }

        User user = userDAO.findById(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy người dùng."
            ));
        }

        Role role = userDAO.findRoleByName(dbRoleName);
        if (role == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Không tìm thấy role " + dbRoleName + " trong hệ thống."
            ));
        }

        String previousRole = user.getRole() == null ? null : user.getRole().getRoleName();
        user.setRole(role);
        userDAO.update(user);

        authAuditService.logRegisterSuccess(user.getEmail(), servletRequest);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật role thành công.",
                "userId", user.getUserId(),
                "roleName", role.getRoleName(),
                "previousRole", previousRole == null ? "" : previousRole
        ));
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}

