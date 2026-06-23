package com.auction.product.controller;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.notification.entity.Notification;
import com.auction.notification.service.NotificationService;
import com.auction.product.entity.Contract;
import com.auction.product.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Seller platform agreement: a seller signs this during the KYC step. The signed
 * contract is surfaced to staff (alongside KYC) and reviewed together.
 */
@RestController
@RequestMapping("/api/seller-contract")
@RequiredArgsConstructor
public class SellerContractController {

    private final ContractService contractService;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @PostMapping("/sign")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sign(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        User user = userRepository.findById(Math.toIntExact(currentUser.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : null;
        if (roleName == null || !"Seller".equalsIgnoreCase(roleName)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Chỉ tài khoản Seller mới cần ký hợp đồng nền tảng."));
        }

        Contract contract = contractService.signSellerContract(user.getUserId());

        // Notify all staff that a new seller agreement is awaiting review (sent with KYC).
        List<User> staff = userRepository.findAllByRole_RoleName("Staff");
        for (User s : staff) {
            notificationService.createNotification(
                    s.getUserId(),
                    "Hợp đồng seller mới chờ duyệt",
                    "Seller " + user.getFullName() + " (" + user.getEmail() + ") đã ký hợp đồng nền tảng và đang chờ duyệt KYC.",
                    Notification.NotificationType.GENERAL,
                    contract.getContractId(),
                    "SELLER_CONTRACT");
        }

        return ResponseEntity.ok(ApiResponse.success("Đã ký hợp đồng, đang chờ staff duyệt.", toMap(contract, true)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> myContract(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        Contract contract = contractService.getSellerContract(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(toMap(contract, contract != null)));
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
        map.put("contractId", contract != null ? contract.getContractId() : null);
        map.put("signedAt", contract != null ? contract.getCreatedAt() : null);
        map.put("fileUrl", contract != null ? contract.getFileUrl() : null);
        return map;
    }
}
