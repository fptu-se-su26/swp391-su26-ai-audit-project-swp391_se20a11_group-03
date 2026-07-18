package com.auction.account.service;

import com.auction.account.dao.UserDAO;
import com.auction.account.entity.Role;
import com.auction.account.entity.User;
import com.auction.account.util.PasswordUtil;
import org.springframework.stereotype.Service;
import java.util.Locale;

@Service
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

    public AuthResult register(String fullName, String email, String password, String confirmPassword) {
        String normalizedFullName = normalize(fullName);
        String normalizedEmail = normalize(email);
        if (normalizedEmail != null) {
            normalizedEmail = normalizedEmail.toLowerCase(Locale.ROOT);
        }

        String validationError = authValidator.validateRegistration(
                normalizedFullName,
                normalizedEmail,
                password,
                confirmPassword
        );
        if (validationError != null) {
            return AuthResult.failure(validationError);
        }

        if (userDAO.existsByEmail(normalizedEmail)) {
            return AuthResult.failure("Email đã tồn tại. Vui lòng dùng email khác.");
        }
        String salt = PasswordUtil.generateSalt();
        int iterations = PasswordUtil.getIterations();
        String passwordHash = PasswordUtil.hashPassword(password, salt, iterations);
        User user = new User(normalizedFullName, normalizedEmail, null, null, passwordHash, salt, iterations);
        user.setVerificationLevel((byte) 0);
        user.setProfileStatus("PENDING_EMAIL_VERIFY");

        try {
            Role userRole = userDAO.findRoleByName("User");
            if (userRole == null) {
                return AuthResult.failure("Không thể tạo tài khoản. Vui lòng thử lại sau.");
            }
            user.setRole(userRole);
            userDAO.register(user);
            return AuthResult.success("Đăng ký thành công. Vui lòng xác minh email trước khi đăng nhập.", user);
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
        if (!user.isEmailVerified()) {
            return AuthResult.failure("Email chưa được xác minh. Vui lòng kiểm tra hộp thư trước khi đăng nhập.");
        }

        return AuthResult.success("Đăng nhập thành công.", user);
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    /**
     * The database still requires a unique phone value. Accounts created
     * without one receive an internal placeholder that can be replaced later
     * from the profile or KYC flow.
     */
    private String generatePlaceholderPhone() {
        String candidate = "L" + System.currentTimeMillis()
                + String.format("%04d", (int) (Math.random() * 10000));
        return candidate.length() > 20 ? candidate.substring(0, 20) : candidate;
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

