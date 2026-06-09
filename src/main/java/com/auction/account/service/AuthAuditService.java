package com.auction.account.service;

import com.auction.account.util.AuditLogUtil;

import jakarta.servlet.http.HttpServletRequest;

public final class AuthAuditService {
    public void logLoginSuccess(String loginId, HttpServletRequest request) {
        AuditLogUtil.authEvent("LOGIN", true, loginId, "success", request.getRemoteAddr(), request.getHeader("User-Agent"));
    }

    public void logLoginFailure(String loginId, String message, HttpServletRequest request) {
        AuditLogUtil.authEvent("LOGIN", false, loginId, message, request.getRemoteAddr(), request.getHeader("User-Agent"));
    }

    public void logRegisterSuccess(String email, HttpServletRequest request) {
        AuditLogUtil.authEvent("REGISTER", true, email, "created", request.getRemoteAddr(), request.getHeader("User-Agent"));
    }

    public void logRegisterFailure(String email, String message, HttpServletRequest request) {
        AuditLogUtil.authEvent("REGISTER", false, email, message, request.getRemoteAddr(), request.getHeader("User-Agent"));
    }
}



