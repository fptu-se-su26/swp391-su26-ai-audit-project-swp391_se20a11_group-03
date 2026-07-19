package com.auction.account.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

/**
 * Gửi SMS qua SpeedSMS.vn — nhà cung cấp Việt Nam, dùng làm kênh OTP thay thế
 * khi Twilio không khả dụng (trial bị chặn số VN). Đăng ký tại speedsms.vn để
 * lấy access token, đặt vào biến môi trường SPEEDSMS_ACCESS_TOKEN.
 */
@Service
public class SpeedSmsService {
    private static final String SEND_URL = "https://api.speedsms.vn/index.php/sms/send";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${speedsms.access-token:}")
    private String accessToken;

    // 2 = đầu số ngẫu nhiên, 3 = brandname riêng, 4 = brandname Notify, 5 = gửi qua app Android.
    @Value("${speedsms.sms-type:2}")
    private int smsType;

    @Value("${speedsms.sender:}")
    private String sender;

    public SpeedSmsService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public boolean isConfigured() {
        return accessToken != null && !accessToken.isBlank();
    }

    /** phone ở định dạng E.164 (+84...); SpeedSMS nhận dạng 84xxxxxxxxx không có dấu +. */
    public void sendSms(String phone, String content) {
        if (!isConfigured()) {
            throw new IllegalStateException("SpeedSMS chưa được cấu hình.");
        }
        String to = phone.startsWith("+") ? phone.substring(1) : phone;
        String body;
        try {
            body = objectMapper.writeValueAsString(new SendPayload(new String[]{to}, content, smsType, sender));
        } catch (IOException ex) {
            throw new IllegalStateException("Không thể tạo yêu cầu gửi SMS.", ex);
        }
        String credentials = Base64.getEncoder()
                .encodeToString((accessToken + ":x").getBytes(StandardCharsets.UTF_8));
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(SEND_URL))
                .timeout(Duration.ofSeconds(15))
                .header("Authorization", "Basic " + credentials)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();
        try {
            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            JsonNode json = objectMapper.readTree(response.body());
            boolean ok = response.statusCode() >= 200 && response.statusCode() < 300
                    && "success".equalsIgnoreCase(json.path("status").asText());
            if (!ok) {
                throw new IllegalStateException("Dịch vụ SMS từ chối yêu cầu: "
                        + json.path("message").asText(json.path("invalid").toString()));
            }
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Kết nối tới dịch vụ SMS bị gián đoạn.", ex);
        } catch (IOException ex) {
            throw new IllegalStateException("Không thể kết nối tới dịch vụ SMS.", ex);
        }
    }

    private record SendPayload(String[] to, String content, int sms_type, String sender) {
    }
}
