package com.vnec.service;

import com.vnec.dao.UserDAO;
import com.vnec.model.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AuthServiceTest {
    @Test
    void register_shouldCreateUserWhenDataIsValidAndUnique() {
        FakeUserDAO userDAO = new FakeUserDAO();
        AuthService service = new AuthService(userDAO, new AuthValidator());

        AuthService.AuthResult result = service.register(
                "Nguyen Van A",
                "a@b.com",
                "0912345678",
                "123456",
                "Password1",
                "Password1"
        );

        assertTrue(result.isSuccess());
        assertEquals("Đăng ký thành công.", result.getMessage());
        assertNotNull(result.getUser());
        assertEquals(1, userDAO.registerCallCount);
    }

    @Test
    void register_shouldRejectDuplicateEmail() {
        FakeUserDAO userDAO = new FakeUserDAO();
        userDAO.emailExists = true;
        AuthService service = new AuthService(userDAO, new AuthValidator());

        AuthService.AuthResult result = service.register(
                "Nguyen Van A",
                "a@b.com",
                "0912345678",
                "123456",
                "Password1",
                "Password1"
        );

        assertFalse(result.isSuccess());
        assertEquals("Email đã tồn tại. Vui lòng dùng email khác.", result.getMessage());
        assertNull(result.getUser());
    }

    @Test
    void login_shouldSucceedWithValidCredentials() {
        FakeUserDAO userDAO = new FakeUserDAO();
        userDAO.userToReturn = buildUser("a@b.com", "0912345678", "123456", "Password1");
        AuthService service = new AuthService(userDAO, new AuthValidator());

        AuthService.AuthResult result = service.login("a@b.com", "Password1");

        assertTrue(result.isSuccess());
        assertEquals("Đăng nhập thành công.", result.getMessage());
        assertNotNull(result.getUser());
    }

    @Test
    void login_shouldRejectWrongPassword() {
        FakeUserDAO userDAO = new FakeUserDAO();
        userDAO.userToReturn = buildUser("a@b.com", "0912345678", "123456", "Password1");
        AuthService service = new AuthService(userDAO, new AuthValidator());

        AuthService.AuthResult result = service.login("a@b.com", "WrongPass1");

        assertFalse(result.isSuccess());
        assertEquals("Thông tin đăng nhập không chính xác hoặc tài khoản chưa được kích hoạt.", result.getMessage());
    }

    private User buildUser(String email, String phone, String identity, String password) {
        String salt = "00112233445566778899aabbccddeeff";
        String hash = com.vnec.util.PasswordUtil.hashPassword(password, salt, com.vnec.util.PasswordUtil.getIterations());
        return new User("Nguyen Van A", email, phone, identity, hash, salt, com.vnec.util.PasswordUtil.getIterations());
    }

    private static final class FakeUserDAO extends UserDAO {
        boolean emailExists;
        boolean phoneExists;
        boolean identityExists;
        int registerCallCount;
        User userToReturn;

        @Override
        public boolean existsByEmail(String email) {
            return emailExists;
        }

        @Override
        public boolean existsByPhone(String phone) {
            return phoneExists;
        }

        @Override
        public boolean existsByIdentityNumber(String identityNumber) {
            return identityExists;
        }

        @Override
        public boolean register(User user) {
            registerCallCount++;
            userToReturn = user;
            return true;
        }

        @Override
        public User findByLoginId(String loginId) {
            return userToReturn;
        }
    }
}
