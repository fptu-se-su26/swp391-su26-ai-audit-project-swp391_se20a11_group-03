package com.auction.account.service;

import com.auction.account.dao.UserDAO;
import com.auction.account.model.User;
import com.auction.account.util.PasswordUtil;

public class AuthService {
    private final UserDAO userDAO;
    private final AuthValidator authValidator;

    public AuthService() {
        this(new UserDAO(), new AuthValidator());
    }

    public AuthService(UserDAO userDAO, AuthValidator authValidator) {
        this.userDAO = userDAO;
        this.authValidator = authValidator;
    }

    public AuthResult register(String fullName, String email, String phone, String identityNumber, String password, String confirmPassword) {
        String normalizedFullName = normalize(fullName);
        String normalizedEmail = normalize(email);
        String normalizedPhone = normalize(phone);
        String normalizedIdentityNumber = normalize(identityNumber);

        String validationError = authValidator.validateRegistration(
                normalizedFullName,
                normalizedEmail,
                normalizedPhone,
                normalizedIdentityNumber,
                password,
                confirmPassword
        );
        if (validationError != null) {
            return AuthResult.failure(validationError);
        }

        if (userDAO.existsByEmail(normalizedEmail)) {
            return AuthResult.failure("Email đã tồn tại. Vui lòng dùng email khác.");
        }
        if (userDAO.existsByPhone(normalizedPhone)) {
            return AuthResult.failure("Số điện thoại đã tồn tại. Vui lòng dùng số khác.");
        }
        if (userDAO.existsByIdentityNumber(normalizedIdentityNumber)) {
            return AuthResult.failure("Số giấy tờ tùy thân đã tồn tại. Vui lòng kiểm tra lại.");
        }

        String salt = PasswordUtil.generateSalt();
        int iterations = PasswordUtil.getIterations();
        String passwordHash = PasswordUtil.hashPassword(password, salt, iterations);
        User user = new User(normalizedFullName, normalizedEmail, normalizedPhone, normalizedIdentityNumber, passwordHash, salt, iterations);
        user.setVerificationLevel((byte) 0);

        try {
            userDAO.register(user);
            return AuthResult.success("Đăng ký thành công.", user);
        } catch (RuntimeException ex) {
            return AuthResult.failure("Không thể tạo tài khoản. Vui lòng thử lại sau.");
        }
    }

    public AuthResult login(String loginId, String password) {
        String normalizedLoginId = normalize(loginId);
        String validationError = authValidator.validateLogin(normalizedLoginId, password);
        if (validationError != null) {
            return AuthResult.failure(validationError);
        }

        User user = userDAO.findByLoginId(normalizedLoginId);
        if (user == null) {
            return AuthResult.failure("Thông tin đăng nhập không chính xác hoặc tài khoản chưa được kích hoạt.");
        }

        if (!PasswordUtil.matches(password, user.getSalt(), user.getPasswordHash(), user.getPasswordIterations())) {
            return AuthResult.failure("Thông tin đăng nhập không chính xác hoặc tài khoản chưa được kích hoạt.");
        }

        return AuthResult.success("Đăng nhập thành công.", user);
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    public static final class AuthResult {
        private final boolean success;
        private final String message;
        private final User user;

        private AuthResult(boolean success, String message, User user) {
            this.success = success;
            this.message = message;
            this.user = user;
        }

        public static AuthResult success(String message, User user) {
            return new AuthResult(true, message, user);
        }

        public static AuthResult failure(String message) {
            return new AuthResult(false, message, null);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public User getUser() {
            return user;
        }
    }
}


