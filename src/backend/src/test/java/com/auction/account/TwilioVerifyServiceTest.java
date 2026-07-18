package com.auction.account;

import com.auction.account.service.TwilioVerifyService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TwilioVerifyServiceTest {
    private final TwilioVerifyService service = new TwilioVerifyService(new ObjectMapper());

    @Test
    void normalizesVietnameseLocalNumberToE164() {
        assertEquals("+84901234567", service.normalizePhone("090 123 4567"));
    }

    @Test
    void keepsValidInternationalNumber() {
        assertEquals("+84901234567", service.normalizePhone("+84 90 123 4567"));
    }

    @Test
    void rejectsInvalidPhone() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.normalizePhone("abc123")
        );
    }
}
