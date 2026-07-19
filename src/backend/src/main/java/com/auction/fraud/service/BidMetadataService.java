package com.auction.fraud.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class BidMetadataService {
    private final String hashSalt;

    public BidMetadataService(@Value("${app.fraud.device-hash-salt:bidzone-device-v1}") String hashSalt) {
        this.hashSalt = hashSalt;
    }

    public String resolveIpAddress(HttpServletRequest request) {
        String remote = clean(request.getRemoteAddr(), 64);
        // Only accept a forwarded address when the direct peer is local/private (a reverse proxy).
        if (isTrustedProxyAddress(remote)) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return clean(forwarded.split(",")[0].trim(), 64);
            }
        }
        return remote;
    }

    public String resolveDeviceHash(HttpServletRequest request) {
        String deviceId = request.getHeader("X-Device-Id");
        if (deviceId == null || deviceId.isBlank()) return null;
        String normalized = clean(deviceId.trim(), 200);
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(
                    (hashSalt + ":" + normalized).getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }

    private static boolean isTrustedProxyAddress(String value) {
        if (value == null) return false;
        return value.equals("127.0.0.1") || value.equals("::1")
                || value.startsWith("10.") || value.startsWith("192.168.")
                || value.matches("172\\.(1[6-9]|2\\d|3[01])\\..*");
    }

    private static String clean(String value, int maxLength) {
        if (value == null) return null;
        String clean = value.replaceAll("[\\r\\n]", "").trim();
        return clean.length() <= maxLength ? clean : clean.substring(0, maxLength);
    }
}
