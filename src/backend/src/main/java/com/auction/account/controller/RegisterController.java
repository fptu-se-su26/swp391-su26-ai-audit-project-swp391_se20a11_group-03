package com.auction.account.controller;

import com.auction.account.entity.User;
import com.auction.common.service.AuthAuditService;
import com.auction.account.service.AuthService;
import com.auction.account.service.EmailVerificationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping
@RequiredArgsConstructor
public class RegisterController {
    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;
    private final AuthAuditService authAuditService;

    @Value("${app.frontend.base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @GetMapping("/register")
    public String showRegisterPage() {
        return "register";
    }

    @PostMapping("/register")
    public String register(
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("confirmPassword") String confirmPassword,
            HttpServletRequest request,
            HttpSession session,
            Model model
    ) {
        AuthService.AuthResult result = authService.register(
                normalize(fullName),
                normalize(email),
                password,
                confirmPassword
        );

        if (result.isSuccess()) {
            User createdUser = result.getUser();
            emailVerificationService.createAndSendToken(
                    createdUser,
                    frontendBaseUrl + "/auth/verify-email",
                    30
            );
            authAuditService.logRegisterSuccess(email, request);
            session.setAttribute("registered", 1);
            return "redirect:/login";
        }

        authAuditService.logRegisterFailure(email, result.getMessage(), request);
        model.addAttribute("errorMessage", result.getMessage());
        return "register";
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}



