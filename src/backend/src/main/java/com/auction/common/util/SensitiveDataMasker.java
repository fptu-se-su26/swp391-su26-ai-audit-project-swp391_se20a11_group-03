package com.auction.common.util;

/**
 * Masks sensitive identifiers (e.g. CCCD/national ID) for display so they are
 * not shown in full outside of the KYC review flow. Only the last 4 digits are
 * kept: {@code 012345678901 -> "**** **** 8901"}.
 */
public final class SensitiveDataMasker {

    private SensitiveDataMasker() {
    }

    public static String maskCccd(String value) {
        if (value == null) {
            return null;
        }
        String digits = value.replaceAll("\\s+", "");
        if (digits.isEmpty()) {
            return value;
        }
        if (digits.length() <= 4) {
            return "****";
        }
        String last4 = digits.substring(digits.length() - 4);
        return "**** **** " + last4;
    }
}
