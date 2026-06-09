package com.auction.account.controller;

import com.auction.account.model.User;
import com.auction.account.service.EmailVerificationService;
import com.auction.account.util.AppConfig;
import com.auction.account.util.AuditLogUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping
@RequiredArgsConstructor
public class SendEmailVerificationController {
    private static final int TOKEN_VALID_MINUTES = AppConfig.getInt("vnec.email.token.validMinutes", 15);
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/send-email-verification")
    public String sendEmailVerification(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("currentUser") == null) {
            return "redirect:/login";
        }

        User currentUser = (User) session.getAttribute("currentUser");
        String verifyBaseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), request.getContextPath() + "/verify-email");
        emailVerificationService.createAndSendToken(currentUser, verifyBaseUrl, TOKEN_VALID_MINUTES);

        AuditLogUtil.authEvent(
                "VERIFY_EMAIL",
                true,
                currentUser.getEmail(),
                "token_sent",
                request.getRemoteAddr(),
                request.getHeader("User-Agent")
        );

        return "redirect:/profile?email_verification_sent=1";
    }
}



