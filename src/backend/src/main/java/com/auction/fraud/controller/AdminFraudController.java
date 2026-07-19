package com.auction.fraud.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.fraud.dto.*;
import com.auction.fraud.service.AdminFraudService;
import com.auction.fraud.service.FraudConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminFraudController {
    private final FraudConfigService configService;
    private final AdminFraudService adminFraudService;
    private final com.auction.fraud.service.UserRestrictionService userRestrictionService;

    @GetMapping("/settings/fraud-detection")
    public ResponseEntity<ApiResponse<FraudSettingsResponse>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(configService.getSettings()));
    }

    @PatchMapping("/settings/fraud-detection")
    public ResponseEntity<ApiResponse<FraudSettingsResponse>> updateSettings(
            @Valid @RequestBody UpdateFraudSettingsRequest request,
            @AuthenticationPrincipal UserDetailsImpl admin) {
        return ResponseEntity.ok(ApiResponse.success("Fraud settings updated",
                configService.updateSettings(request, requireAdminId(admin))));
    }

    @GetMapping("/fraud-alerts")
    public ResponseEntity<ApiResponse<List<FraudAlertResponse>>> listAlerts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String fraudType,
            @RequestParam(required = false) Long auctionId,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(ApiResponse.success(
                adminFraudService.list(status, riskLevel, fraudType, auctionId, userId)));
    }

    @GetMapping("/fraud-alerts/{id}")
    public ResponseEntity<ApiResponse<FraudAlertResponse>> getAlert(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminFraudService.get(id)));
    }

    @PostMapping("/fraud-alerts/{id}/review")
    public ResponseEntity<ApiResponse<FraudAlertResponse>> review(
            @PathVariable Long id, @Valid @RequestBody(required = false) ReviewFraudAlertRequest request,
            @AuthenticationPrincipal UserDetailsImpl admin) {
        return ResponseEntity.ok(ApiResponse.success(adminFraudService.review(
                id, requireAdminId(admin), request == null ? null : request.note())));
    }

    @PostMapping("/fraud-alerts/{id}/confirm")
    public ResponseEntity<ApiResponse<FraudAlertResponse>> confirm(
            @PathVariable Long id, @Valid @RequestBody(required = false) ReviewFraudAlertRequest request,
            @AuthenticationPrincipal UserDetailsImpl admin) {
        return ResponseEntity.ok(ApiResponse.success(adminFraudService.confirm(
                id, requireAdminId(admin), request == null ? null : request.note())));
    }

    @PostMapping("/fraud-alerts/{id}/dismiss")
    public ResponseEntity<ApiResponse<FraudAlertResponse>> dismiss(
            @PathVariable Long id, @Valid @RequestBody(required = false) ReviewFraudAlertRequest request,
            @AuthenticationPrincipal UserDetailsImpl admin) {
        return ResponseEntity.ok(ApiResponse.success(adminFraudService.dismiss(
                id, requireAdminId(admin), request == null ? null : request.note())));
    }

    @PostMapping("/fraud-alerts/{id}/restore-user")
    public ResponseEntity<ApiResponse<FraudAlertResponse>> restore(
            @PathVariable Long id, @Valid @RequestBody(required = false) ReviewFraudAlertRequest request,
            @AuthenticationPrincipal UserDetailsImpl admin) {
        return ResponseEntity.ok(ApiResponse.success(adminFraudService.restore(
                id, requireAdminId(admin), request == null ? null : request.note())));
    }

    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<ApiResponse<Void>> banUser(
            @PathVariable Long userId,
            @Valid @RequestBody BanUserRequest request,
            @AuthenticationPrincipal UserDetailsImpl admin) {
        userRestrictionService.ban(userId, requireAdminId(admin), null, request.reason());
        return ResponseEntity.ok(ApiResponse.success("User permanently banned: " + request.reason(), null));
    }

    private static Long requireAdminId(UserDetailsImpl admin) {
        if (admin == null) throw new IllegalStateException("Authenticated admin is required");
        return admin.getId();
    }
}
