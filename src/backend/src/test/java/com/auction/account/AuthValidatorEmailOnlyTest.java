package com.auction.account;

import com.auction.account.service.AuthValidator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertEquals;

class AuthValidatorEmailOnlyTest {
    private final AuthValidator validator = new AuthValidator();

    @Test
    void acceptsRegistrationWithoutPhone() {
        assertNull(validator.validateRegistration(
                "Nguyen Van A",
                "user@example.com",
                "StrongPass1",
                "StrongPass1"
        ));
    }

    @Test
    void rejectsInvalidEmail() {
        assertEquals(
                "Email không hợp lệ.",
                validator.validateRegistration(
                        "Nguyen Van A",
                        "not-an-email",
                        "StrongPass1",
                        "StrongPass1"
                )
        );
    }
}
