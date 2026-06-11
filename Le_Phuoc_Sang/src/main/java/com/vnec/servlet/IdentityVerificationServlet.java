package com.vnec.servlet;

import com.vnec.dao.UserDAO;
import com.vnec.model.User;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.time.LocalDateTime;

public class IdentityVerificationServlet extends HttpServlet {
    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        User currentUser = session == null ? null : (User) session.getAttribute("currentUser");
        if (currentUser == null) {
            response.sendRedirect(request.getContextPath() + "/login.jsp");
            return;
        }

        currentUser.setIdentityVerified(true);
        currentUser.setIdentityVerifiedAt(LocalDateTime.now());
        currentUser.setVerificationLevel((byte) Math.max(currentUser.getVerificationLevel(), 2));
        currentUser.setProfileStatus("VERIFIED");
        userDAO.update(currentUser);
        session.setAttribute("currentUser", currentUser);
        response.sendRedirect(request.getContextPath() + "/profile?identity_verified=1");
    }
}
