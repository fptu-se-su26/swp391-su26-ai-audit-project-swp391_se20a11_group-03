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
        assertEquals("+84901234567", service.normalizePhone("0901234567"));
    }

    @Test
    void rejectsInternationalInputBecauseFormRequiresTenLocalDigits() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.normalizePhone("+84901234567")
        );
    }

    @Test
    void rejectsPhoneWithWrongLength() {
        assertThrows(
                IllegalArgumentException.class,
                () -> service.normalizePhone("090123456")
        );
    }
}
