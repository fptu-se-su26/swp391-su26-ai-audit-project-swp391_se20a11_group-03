package com.vnec.servlet;

import com.vnec.model.User;
import com.vnec.service.ProfileService;
import com.vnec.util.TokenUtil;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

public class EmailVerificationServlet extends HttpServlet {
    private final ProfileService profileService = new ProfileService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String rawToken = request.getParameter("token");

        if (rawToken == null || rawToken.trim().isEmpty()) {
            request.setAttribute("errorMessage", "Token xác minh không hợp lệ.");
            request.getRequestDispatcher("/profile.jsp").forward(request, response);
            return;
        }

        String tokenHash = TokenUtil.sha256(rawToken.trim());
        boolean verified = profileService.verifyEmailToken(tokenHash);

        if (verified) {
            // Refresh session user nếu đã đăng nhập
            HttpSession session = request.getSession(false);
            if (session != null) {
                User currentUser = (User) session.getAttribute("currentUser");
                if (currentUser != null) {
                    User refreshed = profileService.getUserById(currentUser.getId());
                    if (refreshed != null) {
                        session.setAttribute("currentUser", refreshed);
                    }
                }
            }
            response.sendRedirect(request.getContextPath() + "/profile?email_verified=1");
        } else {
            request.setAttribute("errorMessage", "Token không hợp lệ, đã sử dụng hoặc đã hết hạn.");
            request.getRequestDispatcher("/login.jsp").forward(request, response);
        }
    }
}
