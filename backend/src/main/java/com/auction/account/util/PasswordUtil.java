package com.auction.account.util;

import com.auction.config.AppConfig;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.spec.InvalidKeySpecException;

public final class PasswordUtil {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int SALT_LENGTH = 16;
    private static final int DEFAULT_ITERATIONS = 120_000;
    private static final int KEY_LENGTH = 256;

    private PasswordUtil() {
    }

    public static int getIterations() {
        return AppConfig.getInt("vnec.password.iterations", DEFAULT_ITERATIONS);
    }

    public static String generateSalt() {
        byte[] salt = new byte[SALT_LENGTH];
        RANDOM.nextBytes(salt);
        return bytesToHex(salt);
    }

    public static String hashPassword(String password, String salt) {
        return hashPassword(password, salt, getIterations());
    }

    public static String hashPassword(String password, String salt, int iterations) {
        if (password == null || salt == null) {
            throw new IllegalArgumentException("Password and salt must not be null");
        }
        try {
            PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), hexToBytes(salt), iterations, KEY_LENGTH);
            SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] encoded = factory.generateSecret(spec).getEncoded();
            return bytesToHex(encoded);
        } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
            throw new IllegalStateException("Password hashing failed", e);
        }
    }

    public static boolean matches(String rawPassword, String salt, String expectedHash) {
        return matches(rawPassword, salt, expectedHash, getIterations());
    }

    public static boolean matches(String rawPassword, String salt, String expectedHash, int iterations) {
        if (rawPassword == null || salt == null || expectedHash == null) {
            return false;
        }
        String actualHash = hashPassword(rawPassword, salt, iterations);
        return MessageDigest.isEqual(actualHash.getBytes(java.nio.charset.StandardCharsets.UTF_8),
                expectedHash.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private static byte[] hexToBytes(String hex) {
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(hex.charAt(i), 16) << 4)
                    + Character.digit(hex.charAt(i + 1), 16));
        }
        return data;
    }
}


