package com.auction.account.controller;

import com.auction.account.dto.KycSubmissionResponse;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    /**
     * User submits a KYC application. Multipart so the three ID photos are
     * uploaded as binary parts instead of base64 strings.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submit(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam("fullName") String fullName,
            @RequestParam("phone") String phone,
            @RequestParam("cccdNumber") String cccdNumber,
            @RequestParam("dob") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dob,
            @RequestParam("gender") String gender,
            @RequestParam("issueDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestParam("issuePlace") String issuePlace,
            @RequestParam("frontImage") MultipartFile frontImage,
            @RequestParam("backImage") MultipartFile backImage,
            @RequestParam("selfieImage") MultipartFile selfieImage
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Please sign in to submit KYC"
            ));
        }
        try {
            KycSubmissionResponse result = kycService.submit(
                    currentUser.getId(),
                    fullName, phone, cccdNumber, dob, gender, issueDate, issuePlace,
                    frontImage, backImage, selfieImage
            );
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result,
                    "message", "KYC submitted. Our staff will review it shortly."
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
            ));
        } catch (IOException ex) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to save uploaded images: " + ex.getMessage()
            ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> myLatest(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Please sign in"
            ));
        }
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("success", true);
        body.put("data", kycService.getMyLatest(currentUser.getId()).orElse(null));
        return ResponseEntity.ok(body);
    }

    @GetMapping("/list")
    @PreAuthorize("hasRole('Staff') or hasRole('Admin')")
    public ResponseEntity<List<KycSubmissionResponse>> listByStatus(
            @RequestParam(name = "status", required = false) String status
    ) {
        return ResponseEntity.ok(kycService.listByStatus(status));
    }

    @PostMapping("/{kycId}/approve")
    @PreAuthorize("hasRole('Staff') or hasRole('Admin')")
    public ResponseEntity<?> approve(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long kycId
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", kycService.approve(kycId, currentUser.getId())
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
            ));
        }
    }

    @PostMapping("/{kycId}/reject")
    @PreAuthorize("hasRole('Staff') or hasRole('Admin')")
    public ResponseEntity<?> reject(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long kycId,
            @RequestParam("reason") String reason
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", kycService.reject(kycId, currentUser.getId(), reason)
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
            ));
        }
    }

    @PostMapping("/{kycId}/request-info")
    @PreAuthorize("hasRole('Staff') or hasRole('Admin')")
    public ResponseEntity<?> requestInfo(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable Long kycId,
            @RequestParam(name = "reason", required = false) String reason
    ) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", kycService.requestInfo(kycId, currentUser.getId(), reason)
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
            ));
        }
    }
}
