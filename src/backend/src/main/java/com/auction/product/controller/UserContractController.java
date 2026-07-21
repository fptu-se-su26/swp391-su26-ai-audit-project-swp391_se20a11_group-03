package com.auction.product.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.common.dto.ApiResponse;
import com.auction.product.dto.UserContractDTO;
import com.auction.product.service.UserContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users/me/contracts")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserContractController {

    private final UserContractService userContractService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserContractDTO>>> getMyContracts(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }
        return ResponseEntity.ok(ApiResponse.success(
                userContractService.findMyContracts(currentUser.getId())));
    }

    @GetMapping(value = "/{contractId}/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getMyContractPdf(
            @PathVariable Long contractId,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        byte[] pdf = userContractService.resolveOwnedPdf(currentUser.getId(), contractId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"bidzone-contract-" + contractId + ".pdf\"")
                .body(pdf);
    }
}
