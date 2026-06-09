package com.auction.account.controller;

import com.auction.account.service.AuthAuditService;
import com.auction.account.service.AuthService;
import com.auction.account.service.AuthSessionService;
import com.auction.account.util.LoginRateLimitUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.Duration;

@Controller
@RequestMapping
@RequiredArgsConstructor
public class LoginController {
    private final AuthService authService;
    private final AuthSessionService authSessionService;
    private final AuthAuditService authAuditService;

    @GetMapping("/login")
    public String showLoginPage() {
        return "login";
    }

    @PostMapping("/login")
    public String login(
            @RequestParam("loginUser") String loginUser,
            @RequestParam("loginPass") String loginPass,
            HttpServletRequest request,
            HttpSession session,
            Model model
    ) {
        String normalizedUser = normalize(loginUser);
        String rateLimitKey = buildRateLimitKey(request.getRemoteAddr(), normalizedUser);

        LoginRateLimitUtil.RateLimitStatus rateStatus = LoginRateLimitUtil.checkAllowed(rateLimitKey);
        if (!rateStatus.isAllowed()) {
            authAuditService.logLoginFailure(normalizedUser, "rate_limited", request);
            model.addAttribute("errorMessage", "Tạm thời quá nhiều lần thử đăng nhập. Vui lòng thử lại sau " + formatRetryAfter(rateStatus.getRetryAfter()) + ".");
            return "login";
        }

        AuthService.AuthResult result = authService.login(normalizedUser, loginPass);
        if (result.isSuccess()) {
            LoginRateLimitUtil.recordSuccess(rateLimitKey);
            authSessionService.createAuthenticatedSession(request, result.getUser());
            authAuditService.logLoginSuccess(normalizedUser, request);
            session.setAttribute("login", 1);
            return "redirect:/profile";
        }

        LoginRateLimitUtil.recordFailure(rateLimitKey);
        authAuditService.logLoginFailure(normalizedUser, result.getMessage(), request);
        model.addAttribute("errorMessage", result.getMessage());
        return "login";
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private String buildRateLimitKey(String ip, String loginId) {
        return (ip == null ? "unknown-ip" : ip) + ":" + (loginId == null ? "unknown-user" : loginId.toLowerCase());
    }

    private String formatRetryAfter(Duration duration) {
        long minutes = Math.max(1, duration.toMinutes());
        return minutes + " phút";
    }
}



