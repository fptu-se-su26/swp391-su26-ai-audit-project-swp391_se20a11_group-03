package com.vnec.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class AuthValidatorTest {
    private final AuthValidator validator = new AuthValidator();

    @Test
    void validateRegistration_shouldRejectMissingFields() {
        String error = validator.validateRegistration(null, "a@b.com", "0912345678", "123456", "Password1", "Password1");

        assertEquals("Vui lòng nhập đầy đủ thông tin.", error);
    }

    @Test
    void validateRegistration_shouldAcceptValidInput() {
        String error = validator.validateRegistration(
                "Nguyen Van A",
                "a@b.com",
                "0912345678",
                "123456",
                "Password1",
                "Password1"
        );

        assertNull(error);
    }

    @Test
    void validateLogin_shouldRejectMissingCredentials() {
        String error = validator.validateLogin("   ", "password");

        assertEquals("Vui lòng nhập đầy đủ thông tin đăng nhập.", error);
    }
}
