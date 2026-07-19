package com.auction.account.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Locale;

@Service
public class TwilioVerifyService {
    private static final String VERIFY_BASE_URL = "https://verify.twilio.com/v2/Services/";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${twilio.verify.api-key:}")
    private String apiKey;

    @Value("${twilio.verify.api-secret:}")
    private String apiSecret;

    @Value("${twilio.verify.service-sid:}")
    private String serviceSid;

    public TwilioVerifyService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public boolean isConfigured() {
        return !apiKey.isBlank() && !apiSecret.isBlank() && !serviceSid.isBlank();
    }

    public String normalizePhone(String value) {
        String localPhone = value == null ? "" : value.trim();
        if (!localPhone.matches("^0\\d{9}$")) {
            throw new IllegalArgumentException(
                    "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0.");
        }
        return "+84" + localPhone.substring(1);
    }

    public void startVerification(String phone, String channel) {
        String normalizedChannel = normalizeChannel(channel);
        JsonNode response = post(
                "Verifications",
                "To=" + encode(phone) + "&Channel=" + encode(normalizedChannel)
        );
        if (!"pending".equalsIgnoreCase(response.path("status").asText())) {
            throw new IllegalStateException("Không thể gửi mã xác minh lúc này.");
        }
    }

    public boolean checkVerification(String phone, String code) {
        JsonNode response = post(
                "VerificationCheck",
                "To=" + encode(phone) + "&Code=" + encode(code)
        );
        return "approved".equalsIgnoreCase(response.path("status").asText());
    }

    private String normalizeChannel(String channel) {
        String normalized = channel == null ? "" : channel.trim().toLowerCase(Locale.ROOT);
        if (!"sms".equals(normalized) && !"whatsapp".equals(normalized)) {
            throw new IllegalArgumentException("Kênh xác minh phải là SMS hoặc WhatsApp.");
        }
        return normalized;
    }

    private JsonNode post(String resource, String formBody) {
        ensureConfigured();
        String credentials = Base64.getEncoder().encodeToString(
                (apiKey + ":" + apiSecret).getBytes(StandardCharsets.UTF_8)
        );
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(VERIFY_BASE_URL + serviceSid + "/" + resource))
                .timeout(Duration.ofSeconds(15))
                .header("Authorization", "Basic " + credentials)
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(formBody))
                .build();
        try {
            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
            );
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Dịch vụ gửi OTP từ chối yêu cầu.");
            }
            return objectMapper.readTree(response.body());
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Kết nối tới dịch vụ OTP bị gián đoạn.", ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Không thể kết nối tới dịch vụ OTP.", ex);
        }
    }

    private void ensureConfigured() {
        if (apiKey.isBlank() || apiSecret.isBlank() || serviceSid.isBlank()) {
            throw new IllegalStateException(
                    "Dịch vụ OTP chưa được cấu hình. Quản trị viên cần thiết lập Twilio Verify.");
        }
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
