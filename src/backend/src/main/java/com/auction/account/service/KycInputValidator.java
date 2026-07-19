package com.auction.account.service;

import java.text.Normalizer;
import java.util.Locale;

public final class KycInputValidator {
    private static final Locale VIETNAMESE = Locale.forLanguageTag("vi-VN");

    private KycInputValidator() {
    }

    public static String normalizeFullName(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Vui lòng nhập họ và tên như trên CCCD.");
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFC)
                .trim()
                .replaceAll("\\s+", " ")
                .toUpperCase(VIETNAMESE);

        if (normalized.length() < 2 || normalized.length() > 150
                || !normalized.matches("^[\\p{Lu} ]+$")) {
            throw new IllegalArgumentException(
                    "Họ và tên KYC chỉ được gồm chữ cái và khoảng trắng.");
        }
        return normalized;
    }
}
