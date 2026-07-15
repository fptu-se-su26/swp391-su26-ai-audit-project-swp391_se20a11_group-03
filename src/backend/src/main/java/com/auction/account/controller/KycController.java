package com.auction.account.controller;

import com.auction.account.dto.CccdOcrResult;
import com.auction.account.dto.KycSubmissionResponse;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.service.CccdOcrService;
import com.auction.account.service.KycService;
import com.auction.common.service.GeminiOcrService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final CccdOcrService cccdOcrService;
    private final GeminiOcrService geminiOcrService;

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
            @RequestParam("selfieImage") MultipartFile selfieImage,
            @RequestParam(value = "signSellerAgreement", defaultValue = "false") boolean signSellerAgreement
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
                    frontImage, backImage, selfieImage, signSellerAgreement
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
        } catch (DataIntegrityViolationException ex) {
            String message = ex.getMessage() != null && ex.getMessage().contains("CccdNumber")
                    ? "Số CCCD này đã được đăng ký trên hệ thống. Vui lòng đăng nhập đúng tài khoản hoặc liên hệ nhân viên hỗ trợ."
                    : "Không thể lưu hồ sơ KYC. Vui lòng thử lại hoặc liên hệ nhân viên.";
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", message
            ));
        } catch (IOException ex) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to save uploaded images: " + ex.getMessage()
            ));
        }
    }

    /**
     * OCR front + back CCCD images and return extracted fields for user review.
     */
    @PostMapping(value = "/ocr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> ocr(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @RequestParam("frontImage") MultipartFile frontImage,
            @RequestParam("backImage") MultipartFile backImage
    ) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Please sign in"
            ));
        }
        try {
            CccdOcrResult result = cccdOcrService.extract(currentUser.getId(), frontImage, backImage);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", result,
                    "message", result.getMessage()
            ));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", ex.getMessage()
            ));
        } catch (IOException ex) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to process images: " + ex.getMessage()
            ));
        }
    }

    /**
     * Scan a single CCCD image via Google Gemini and return raw extracted JSON.
     */
    @CrossOrigin(origins = "*")
    @PostMapping(value = "/scan-cccd", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> scanCccd(@RequestParam("image") MultipartFile image) {
        try {
            String json = geminiOcrService.scanIdCard(image);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"" + escapeJson(ex.getMessage()) + "\"}");
        } catch (IOException ex) {
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"" + escapeJson("Failed to read image: " + ex.getMessage()) + "\"}");
        } catch (Exception ex) {
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"error\":\"" + escapeJson(ex.getMessage()) + "\"}");
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

    /**
     * Streams a private KYC image. Access is limited to the owner of the
     * submission or a staff/admin reviewer; the raw Cloudinary asset itself is
     * private (authenticated) and never directly reachable.
     */
    @GetMapping("/{kycId}/image/{which}")
    public ResponseEntity<byte[]> image(
            @AuthenticationPrincipal UserDetailsImpl currentUser,
            @PathVariable("kycId") Long kycId,
            @PathVariable("which") String which) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        boolean isStaff = currentUser.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .anyMatch(r -> "ROLE_Staff".equals(r) || "ROLE_Admin".equals(r));
        try {
            byte[] bytes = kycService.getImageBytes(kycId, which, currentUser.getId(), isStaff);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .header("Cache-Control", "private, max-age=300")
                    .body(bytes);
        } catch (SecurityException ex) {
            return ResponseEntity.status(403).build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        } catch (Exception ex) {
            return ResponseEntity.notFound().build();
        }
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
            @PathVariable("kycId") Long kycId
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
            @PathVariable("kycId") Long kycId,
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
            @PathVariable("kycId") Long kycId,
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

    private static String escapeJson(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }
}
