package com.vnec.service;

import com.vnec.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

public final class AuthSessionService {
    private static final int SESSION_TIMEOUT_SECONDS = 30 * 60;

    public HttpSession createAuthenticatedSession(HttpServletRequest request, User user) {
        invalidateExistingSession(request);
        HttpSession session = request.getSession(true);
        session.setMaxInactiveInterval(SESSION_TIMEOUT_SECONDS);
        session.setAttribute("currentUser", user);
        return session;
    }

    public void invalidateExistingSession(HttpServletRequest request) {
        HttpSession existing = request.getSession(false);
        if (existing != null) {
            existing.invalidate();
        }
    }
}
