package com.auction.premium.controller;

import com.auction.account.security.UserDetailsImpl;
import com.auction.premium.dto.*;
import com.auction.premium.entity.*;
import com.auction.premium.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/premium") @RequiredArgsConstructor
public class PremiumController {
    private final AppraisalService appraisalService;
    private final AutoBidConfigService autoBidConfigService;

    @PostMapping("/appraisals") @PreAuthorize("hasRole('Seller')")
    public AppraisalRequest createAppraisal(@AuthenticationPrincipal UserDetailsImpl user,
                                            @Valid @RequestBody CreateAppraisalRequest request) {
        return appraisalService.create(user.getId(), request.productId());
    }

    @PutMapping("/appraisals/{id}") @PreAuthorize("hasRole('Staff') or hasRole('Admin')")
    public AppraisalRequest appraise(@PathVariable Long id, @Valid @RequestBody UpdateAppraisalRequest request) {
        return appraisalService.appraise(id, request.recommendedPrice(), request.expertNote());
    }

    @PutMapping("/auto-bids") @PreAuthorize("hasAnyRole('User','Seller')")
    public AutoBidConfig configureAutoBid(@AuthenticationPrincipal UserDetailsImpl user,
                                          @Valid @RequestBody UpsertAutoBidRequest request) {
        return autoBidConfigService.upsert(user.getId(), request.auctionId(), request.maxPrice(), request.active());
    }
}
