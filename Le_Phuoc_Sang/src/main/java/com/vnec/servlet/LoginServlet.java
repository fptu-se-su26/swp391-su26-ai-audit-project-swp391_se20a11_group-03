package com.vnec.servlet;

import com.vnec.service.AuthAuditService;
import com.vnec.service.AuthService;
import com.vnec.service.AuthSessionService;
import com.vnec.util.LoginRateLimitUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.Duration;

public class LoginServlet extends HttpServlet {
    private final AuthService authService = new AuthService();
    private final AuthSessionService authSessionService = new AuthSessionService();
    private final AuthAuditService authAuditService = new AuthAuditService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.sendRedirect(request.getContextPath() + "/login.jsp");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String loginUser = normalize(request.getParameter("loginUser"));
        String loginPass = request.getParameter("loginPass");
        String rateLimitKey = buildRateLimitKey(request.getRemoteAddr(), loginUser);

        LoginRateLimitUtil.RateLimitStatus rateStatus = LoginRateLimitUtil.checkAllowed(rateLimitKey);
        if (!rateStatus.isAllowed()) {
            authAuditService.logLoginFailure(loginUser, "rate_limited", request);
            request.setAttribute("errorMessage", "Tạm thời quá nhiều lần thử đăng nhập. Vui lòng thử lại sau " + formatRetryAfter(rateStatus.getRetryAfter()) + ".");
            request.getRequestDispatcher("/login.jsp").forward(request, response);
            return;
        }

        AuthService.AuthResult result = authService.login(loginUser, loginPass);
        if (result.isSuccess()) {
            LoginRateLimitUtil.recordSuccess(rateLimitKey);
            authSessionService.createAuthenticatedSession(request, result.getUser());
            authAuditService.logLoginSuccess(loginUser, request);
            response.sendRedirect(request.getContextPath() + "/profile?login=1");
        } else {
            LoginRateLimitUtil.recordFailure(rateLimitKey);
            authAuditService.logLoginFailure(loginUser, result.getMessage(), request);
            request.setAttribute("errorMessage", result.getMessage());
            request.getRequestDispatcher("/login.jsp").forward(request, response);
        }
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
