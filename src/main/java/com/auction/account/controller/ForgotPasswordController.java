package com.auction.account.controller;

import com.auction.account.service.PasswordResetService;
import com.auction.account.util.AppConfig;
import com.auction.account.util.AuditLogUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping
@RequiredArgsConstructor
public class ForgotPasswordController {
    private final PasswordResetService passwordResetService;

    @GetMapping("/forgot-password")
    public String showForgotPasswordPage() {
        return "forgot-password";
    }

    @PostMapping("/forgot-password")
    public String requestReset(
            @RequestParam("loginId") String loginId,
            HttpServletRequest request,
            Model model
    ) {
        String resetBaseUrl = AppConfig.get("vnec.password.resetBaseUrl", request.getContextPath() + "/reset-password");
        boolean sent = passwordResetService.requestReset(
                loginId,
                request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath() + "/reset-password",
                AppConfig.getInt("vnec.password.resetValidMinutes", 15)
        );

        AuditLogUtil.authEvent(
                "FORGOT_PASSWORD",
                sent,
                loginId,
                sent ? "reset_link_sent" : "reset_link_failed",
                request.getRemoteAddr(),
                request.getHeader("User-Agent")
        );

        if (sent) {
            model.addAttribute("successMessage", "Nếu tài khoản tồn tại, link đặt lại mật khẩu đã được gửi qua email.");
        } else {
            model.addAttribute("errorMessage", "Không tìm thấy tài khoản phù hợp hoặc không thể gửi email.");
        }
        return "forgot-password";
    }
}



