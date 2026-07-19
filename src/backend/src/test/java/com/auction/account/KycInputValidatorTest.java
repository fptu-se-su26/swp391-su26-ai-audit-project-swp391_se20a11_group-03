package com.auction.account;

import com.auction.account.service.KycInputValidator;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class KycInputValidatorTest {

    @Test
    void normalizesVietnameseNameToUppercase() {
        assertEquals(
                "LÊ PHƯỚC SANG",
                KycInputValidator.normalizeFullName("  Lê   Phước Sang ")
        );
    }

    @Test
    void rejectsDigitsAndPunctuationInName() {
        assertThrows(
                IllegalArgumentException.class,
                () -> KycInputValidator.normalizeFullName("NGUYEN VAN A123")
        );
        assertThrows(
                IllegalArgumentException.class,
                () -> KycInputValidator.normalizeFullName("NGUYEN-VAN-A")
        );
    }
}
