package com.auction.account.controller;

import com.auction.account.dao.PasswordResetTokenDAO;
import com.auction.account.dao.UserDAO;
import com.auction.account.model.PasswordResetToken;
import com.auction.account.model.User;
import com.auction.account.util.AuditLogUtil;
import com.auction.account.util.PasswordUtil;
import com.auction.account.util.TokenUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;

@Controller
@RequestMapping
@RequiredArgsConstructor
public class ResetPasswordController {
    private final PasswordResetTokenDAO tokenDAO;
    private final UserDAO userDAO;

    @GetMapping("/reset-password")
    public String showResetPasswordPage(@RequestParam("token") String token, Model model) {
        if (token == null || token.trim().isEmpty()) {
            model.addAttribute("errorMessage", "Token không hợp lệ.");
            return "reset-password";
        }
        model.addAttribute("token", token);
        return "reset-password";
    }

    @PostMapping("/reset-password")
    public String resetPassword(
            @RequestParam("token") String token,
            @RequestParam("newPassword") String newPassword,
            @RequestParam("confirmPassword") String confirmPassword,
            HttpServletRequest request,
            Model model
    ) {
        if (token == null || token.trim().isEmpty()) {
            model.addAttribute("errorMessage", "Token không hợp lệ.");
            return "reset-password";
        }
        if (newPassword == null || newPassword.trim().isEmpty() || !newPassword.equals(confirmPassword)) {
            model.addAttribute("errorMessage", "Mật khẩu xác nhận không khớp.");
            return "reset-password";
        }
        if (!isStrongPassword(newPassword)) {
            model.addAttribute("errorMessage", "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.");
            return "reset-password";
        }

        String tokenHash = TokenUtil.sha256(token.trim());
        PasswordResetToken resetToken = tokenDAO.findByHash(tokenHash);
        if (resetToken == null || resetToken.getUsedAt() != null || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            model.addAttribute("errorMessage", "Token không hợp lệ hoặc đã hết hạn.");
            return "reset-password";
        }

        User user = resetToken.getUser();
        String salt = PasswordUtil.generateSalt();
        int iterations = PasswordUtil.getIterations();
        user.setSalt(salt);
        user.setPasswordIterations(iterations);
        user.setPasswordHash(PasswordUtil.hashPassword(newPassword, salt, iterations));
        userDAO.update(user);
        tokenDAO.markUsed(resetToken.getId(), LocalDateTime.now());

        AuditLogUtil.authEvent(
                "RESET_PASSWORD",
                true,
                user.getEmail(),
                "password_updated",
                request.getRemoteAddr(),
                request.getHeader("User-Agent")
        );

        model.addAttribute("successMessage", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
        return "login";
    }

    private boolean isStrongPassword(String password) {
        return password != null
                && password.length() >= 8
                && password.matches(".*[A-Z].*")
                && password.matches(".*[a-z].*")
                && password.matches(".*\\d.*");
    }
}



