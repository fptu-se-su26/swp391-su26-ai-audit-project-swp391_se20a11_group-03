package com.auction.account.service;

public final class AuthValidator {
    public String validateRegistration(String fullName, String email, String password, String confirmPassword) {
        if (isBlank(fullName) || isBlank(email) || isBlank(password) || isBlank(confirmPassword)) {
            return "Vui lòng nhập đầy đủ thông tin.";
        }
        if (fullName.length() < 2 || fullName.length() > 100) {
            return "Họ và tên phải có độ dài từ 2 đến 100 ký tự.";
        }
        if (!password.equals(confirmPassword)) {
            return "Mật khẩu xác nhận không khớp.";
        }
        if (!isStrongPassword(password)) {
            return "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.";
        }
        if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            return "Email không hợp lệ.";
        }
        return null;
    }

    public String validateLogin(String loginId, String password) {
        if (isBlank(loginId) || isBlank(password)) {
            return "Vui lòng nhập đầy đủ thông tin đăng nhập.";
        }
        return null;
    }

    private boolean isStrongPassword(String password) {
        return password != null
                && password.length() >= 8
                && password.matches(".*[A-Z].*")
                && password.matches(".*[a-z].*")
                && password.matches(".*\\d.*");
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}



