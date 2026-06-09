package com.vnec.servlet;

import com.vnec.model.User;
import com.vnec.service.AuthAuditService;
import com.vnec.service.AuthService;
import com.vnec.service.AuthSessionService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

public class RegisterServlet extends HttpServlet {
    private final AuthService authService = new AuthService();
    private final AuthSessionService authSessionService = new AuthSessionService();
    private final AuthAuditService authAuditService = new AuthAuditService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.sendRedirect(request.getContextPath() + "/register.jsp");
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        String fullName = normalize(request.getParameter("fullName"));
        String email = normalize(request.getParameter("email"));
        String phone = normalize(request.getParameter("phone"));
        String identity = normalize(request.getParameter("identity"));
        String password = request.getParameter("password");
        String confirmPassword = request.getParameter("confirmPassword");

        AuthService.AuthResult result = authService.register(fullName, email, phone, identity, password, confirmPassword);
        if (result.isSuccess()) {
            User createdUser = result.getUser();
            authSessionService.createAuthenticatedSession(request, createdUser);
            authAuditService.logRegisterSuccess(email, request);
            response.sendRedirect(request.getContextPath() + "/profile?registered=1");
        } else {
            authAuditService.logRegisterFailure(email, result.getMessage(), request);
            request.setAttribute("errorMessage", result.getMessage());
            request.getRequestDispatcher("/register.jsp").forward(request, response);
        }
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}
