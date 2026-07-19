package com.auction.account.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping
public class IdentityVerificationController {

    /**
     * Legacy self-verification is intentionally disabled. Identity verification
     * can only be granted by staff approving a KycProfiles submission.
     */
    @PostMapping("/identity-verification")
    public String verifyIdentity() {
        return "redirect:/profile?kyc_required=1";
    }
}



