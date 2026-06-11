package com.vnec.servlet;

import com.vnec.service.PasswordResetService;
import com.vnec.util.AuditLogUtil;
import com.vnec.util.AppConfig;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/forgot-password")
public class ForgotPasswordServlet extends HttpServlet {
    private final PasswordResetService passwordResetService = new PasswordResetService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        String loginId = request.getParameter("loginId");
        String resetBaseUrl = AppConfig.get("vnec.password.resetBaseUrl", request.getContextPath() + "/reset-password");
        boolean sent = passwordResetService.requestReset(loginId, request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath() + "/reset-password", AppConfig.getInt("vnec.password.resetValidMinutes", 15));

        AuditLogUtil.authEvent("FORGOT_PASSWORD", sent, loginId, sent ? "reset_link_sent" : "reset_link_failed", request.getRemoteAddr(), request.getHeader("User-Agent"));

        if (sent) {
            request.setAttribute("successMessage", "Nếu tài khoản tồn tại, link đặt lại mật khẩu đã được gửi qua email.");
        } else {
            request.setAttribute("errorMessage", "Không tìm thấy tài khoản phù hợp hoặc không thể gửi email.");
        }
        request.getRequestDispatcher("/forgot-password.jsp").forward(request, response);
    }
}