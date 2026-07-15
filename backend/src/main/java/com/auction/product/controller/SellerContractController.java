package com.auction.product.controller;

import com.auction.account.dao.RoleRepository;
import com.auction.account.dao.UserRepository;
import com.auction.account.entity.Role;
import com.auction.account.entity.User;
import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.product.entity.Contract;
import com.auction.product.service.ContractPdfAccessService;
import com.auction.product.service.ContractService;
import com.auction.product.service.SellerContractPdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Seller platform agreement: signed during seller registration ({@code /become-seller})
 * or on the KYC page. Staff reviews alongside KYC.
 */
@RestController
@RequestMapping("/api/seller-contract")
@RequiredArgsConstructor
public class SellerContractController {

    private final ContractService contractService;
    private final ContractPdfAccessService contractPdfAccessService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SellerContractPdfService sellerContractPdfService;

    /** Draft PDF preview (watermarked) before electronic signature. */
    @GetMapping(value = "/preview-pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> previewPdf(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findById(Math.toIntExact(currentUser.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        byte[] pdf = sellerContractPdfService.generatePreviewPdf(
                user.getUserId(),
                displayName(user),
                user.getEmail());
        if (pdf.length == 0) {
            return ResponseEntity.internalServerError().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"seller-agreement-preview.pdf\"")
                .body(pdf);
    }

    /**
     * Acknowledges agreement to the seller contract (preview step).
     * Does not persist the contract or change role — use {@link #submit} after KYC is approved.
     */
    @PostMapping("/sign")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sign(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        User user = userRepository.findById(Math.toIntExact(currentUser.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;

        if (roleName != null
                && !"User".equalsIgnoreCase(roleName)
                && !"Seller".equalsIgnoreCase(roleName)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Chỉ tài khoản người mua hoặc người bán mới có thể ký hợp đồng nền tảng."));
        }

        boolean persisted = contractService.hasSellerContract(user.getUserId());
        Map<String, Object> body = toMap(
                contractService.getSellerContract(user.getUserId()),
                persisted);
        body.put("acknowledged", true);
        body.put("signed", persisted);
        body.put("roleName", roleName != null ? roleName : "User");
        body.put("roleUpgraded", false);
        body.put("pendingPersistence", !persisted);
        return ResponseEntity.ok(ApiResponse.success(
                "Đã xác nhận đồng ý hợp đồng. Nhấn Gửi đăng ký Seller để hoàn tất.",
                body));
    }

    /**
     * Persists the seller agreement PDF and upgrades {@code User} → {@code Seller}.
     * Requires identity verification (KYC approved).
     */
    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submit(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        User user = userRepository.findById(Math.toIntExact(currentUser.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isIdentityVerified()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(
                    "Bạn cần hoàn tất xác minh danh tính (KYC được duyệt) trước khi đăng ký seller."));
        }

        String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;
        boolean roleUpgraded = false;

        if (roleName == null || "User".equalsIgnoreCase(roleName)) {
            Role sellerRole = roleRepository.findByRoleName("Seller")
                    .orElseThrow(() -> new ResourceNotFoundException("Seller role not found"));
            user.setRole(sellerRole);
            userRepository.save(user);
            roleUpgraded = true;
        } else if (!"Seller".equalsIgnoreCase(roleName)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Chỉ tài khoản người mua hoặc người bán mới có thể đăng ký seller."));
        }

        Contract contract = contractService.signSellerContract(user.getUserId());
        Map<String, Object> body = toMap(contract, true);
        body.put("acknowledged", true);
        body.put("roleName", "Seller");
        body.put("roleUpgraded", roleUpgraded);
        body.put("pendingPersistence", false);
        return ResponseEntity.ok(ApiResponse.success(
                "Đăng ký seller thành công. Bạn có thể đăng sản phẩm.",
                body));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> myContract(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Contract contract = contractService.getSellerContract(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(toMap(contract, contract != null)));
    }

    @GetMapping(value = "/me/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> myContractPdf(@AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        Contract contract = contractService.getSellerContract(currentUser.getId());
        if (contract == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] pdf = contractPdfAccessService.resolvePdfBytes(contract.getContractId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"seller-agreement.pdf\"")
                .body(pdf);
    }

    @GetMapping(value = "/user/{userId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasRole('Staff') or hasRole('Admin')")
    public ResponseEntity<byte[]> userContractPdf(@PathVariable("userId") Long userId) {
        Contract contract = contractService.getSellerContract(userId);
        if (contract == null) {
            return ResponseEntity.notFound().build();
        }
        byte[] pdf = contractPdfAccessService.resolvePdfBytes(contract.getContractId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"seller-agreement-" + userId + ".pdf\"")
                .body(pdf);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('Staff') or hasRole('Admin')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> byUser(@PathVariable("userId") Long userId) {
        Contract contract = contractService.getSellerContract(userId);
        return ResponseEntity.ok(ApiResponse.success(toMap(contract, contract != null)));
    }

    private Map<String, Object> toMap(Contract contract, boolean signed) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("signed", signed && contract != null);
        map.put("acknowledged", signed && contract != null);
        map.put("contractId", contract != null ? contract.getContractId() : null);
        map.put("signedAt", contract != null ? contract.getCreatedAt() : null);
        map.put("fileUrl", contract != null ? contract.getFileUrl() : null);
        return map;
    }

    private String displayName(User user) {
        String name = user.getFullName();
        if (name == null || name.isBlank()) {
            name = user.getEmail();
        }
        return name == null ? "#" + user.getUserId() : name;
    }
}
