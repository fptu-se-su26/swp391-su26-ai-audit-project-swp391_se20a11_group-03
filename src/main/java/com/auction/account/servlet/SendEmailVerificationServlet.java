package com.vnec.servlet;

import com.vnec.model.User;
import com.vnec.service.EmailVerificationService;
import com.vnec.util.AuditLogUtil;
import com.vnec.util.AppConfig;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet("/send-email-verification")
public class SendEmailVerificationServlet extends HttpServlet {
    private static final int TOKEN_VALID_MINUTES = AppConfig.getInt("vnec.email.token.validMinutes", 15);
    private final EmailVerificationService emailVerificationService = new EmailVerificationService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("currentUser") == null) {
            response.sendRedirect(request.getContextPath() + "/login.jsp");
            return;
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

        response.sendRedirect(request.getContextPath() + "/profile?email_verification_sent=1");
    }
}