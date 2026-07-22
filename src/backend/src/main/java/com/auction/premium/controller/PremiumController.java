package com.auction.premium.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.premium.dto.PremiumPurchaseRequest;
import com.auction.premium.dto.PremiumPurchaseResponse;
import com.auction.premium.service.PremiumPurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/premium")
@RequiredArgsConstructor
public class PremiumController {

    private final PremiumPurchaseService premiumPurchaseService;

    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('User','Seller')")
    public PremiumPurchaseResponse status(@AuthenticationPrincipal UserDetailsImpl user) {
        return premiumPurchaseService.status(user.getId());
    }

    @PostMapping("/purchase")
    @PreAuthorize("hasAnyRole('User','Seller')")
    public PremiumPurchaseResponse purchase(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody PremiumPurchaseRequest request
    ) {
        return premiumPurchaseService.purchase(user.getId(), request.plan());
    }
}
