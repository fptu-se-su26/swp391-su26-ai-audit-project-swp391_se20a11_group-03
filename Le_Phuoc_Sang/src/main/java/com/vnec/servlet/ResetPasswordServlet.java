package com.vnec.servlet;

import com.vnec.dao.PasswordResetTokenDAO;
import com.vnec.dao.UserDAO;
import com.vnec.model.PasswordResetToken;
import com.vnec.model.User;
import com.vnec.util.AuditLogUtil;
import com.vnec.util.PasswordUtil;
import com.vnec.util.TokenUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.LocalDateTime;

@WebServlet("/reset-password")
public class ResetPasswordServlet extends HttpServlet {
    private final PasswordResetTokenDAO tokenDAO = new PasswordResetTokenDAO();
    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String token = request.getParameter("token");
        if (token == null || token.trim().isEmpty()) {
            request.setAttribute("errorMessage", "Token không hợp lệ.");
            request.getRequestDispatcher("/reset-password.jsp").forward(request, response);
            return;
        }
        request.getRequestDispatcher("/reset-password.jsp").forward(request, response);
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        String token = request.getParameter("token");
        String newPassword = request.getParameter("newPassword");
        String confirmPassword = request.getParameter("confirmPassword");

        if (token == null || token.trim().isEmpty()) {
            request.setAttribute("errorMessage", "Token không hợp lệ.");
            request.getRequestDispatcher("/reset-password.jsp").forward(request, response);
            return;
        }
        if (newPassword == null || newPassword.trim().isEmpty() || !newPassword.equals(confirmPassword)) {
            request.setAttribute("errorMessage", "Mật khẩu xác nhận không khớp.");
            request.getRequestDispatcher("/reset-password.jsp").forward(request, response);
            return;
        }
        if (!isStrongPassword(newPassword)) {
            request.setAttribute("errorMessage", "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.");
            request.getRequestDispatcher("/reset-password.jsp").forward(request, response);
            return;
        }

        String tokenHash = TokenUtil.sha256(token.trim());
        PasswordResetToken resetToken = tokenDAO.findByHash(tokenHash);
        if (resetToken == null || resetToken.getUsedAt() != null || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            request.setAttribute("errorMessage", "Token không hợp lệ hoặc đã hết hạn.");
            request.getRequestDispatcher("/reset-password.jsp").forward(request, response);
            return;
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

        request.setAttribute("successMessage", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
        request.getRequestDispatcher("/login.jsp").forward(request, response);
    }

    private boolean isStrongPassword(String password) {
        return password != null
                && password.length() >= 8
                && password.matches(".*[A-Z].*")
                && password.matches(".*[a-z].*")
                && password.matches(".*\\d.*");
    }
}