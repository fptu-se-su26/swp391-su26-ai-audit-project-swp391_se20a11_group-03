package com.auction.account.service;

import com.auction.config.FptAiConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.ByteArrayOutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class FptAiService {
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public FptAiService() {
        this(HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build(), new ObjectMapper());
    }

    public FptAiService(HttpClient httpClient, ObjectMapper objectMapper) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
    }

    public FptAiService(HttpClient httpClient) {
        this(httpClient, new ObjectMapper());
    }

    public FptAiResult healthCheck() {
        String apiKey = FptAiConfig.getApiKey();
        if (apiKey == null) {
            return FptAiResult.missingKeyResult();
        }

        String endpoint = FptAiConfig.getApiUrl() + "/health";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofSeconds(15))
                .header("api-key", apiKey)
                .header("Accept", "application/json")
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return FptAiResult.success(response.body());
            }
            return FptAiResult.failure("FPT.AI responded with status " + response.statusCode(), response.body());
        } catch (Exception ex) {
            return FptAiResult.failure("Failed to call FPT.AI", ex.getMessage());
        }
    }

    /**
     * Recognize a single Vietnamese ID card image (front or back) via FPT.AI Vision.
     */
    public IdCardScan recognizeVietnameseId(byte[] imageBytes, String filename) {
        String apiKey = FptAiConfig.getApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return IdCardScan.failure("Missing FPT_AI_API_KEY");
        }
        if (imageBytes == null || imageBytes.length == 0) {
            return IdCardScan.failure("Image is empty");
        }

        try {
            String boundary = "----FptBoundary" + UUID.randomUUID();
            byte[] body = buildMultipart(boundary, "image", filename, imageBytes, guessContentType(filename));
            String endpoint = FptAiConfig.getApiUrl() + "/vision/idr/vnm/";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(45))
                    .header("api-key", apiKey)
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                return IdCardScan.failure("FPT.AI HTTP " + response.statusCode() + ": " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            int errorCode = root.path("errorCode").asInt(-1);
            if (errorCode != 0) {
                String errorMessage = root.path("errorMessage").asText("Không nhận dạng được CCCD");
                return IdCardScan.failure(errorMessage);
            }

            JsonNode dataArray = root.path("data");
            if (!dataArray.isArray() || dataArray.isEmpty()) {
                return IdCardScan.failure("FPT.AI không trả về dữ liệu CCCD");
            }

            JsonNode first = dataArray.get(0);
            if (first.has("post_check_result")) {
                // When API returns fraud-check wrapper, actual OCR may be nested; still try first object.
            }
            return IdCardScan.success(first);
        } catch (Exception ex) {
            return IdCardScan.failure("Gọi FPT.AI thất bại: " + ex.getMessage());
        }
    }

    private static byte[] buildMultipart(String boundary, String fieldName, String filename, byte[] fileBytes, String contentType) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        String lineBreak = "\r\n";
        out.write(("--" + boundary + lineBreak).getBytes(StandardCharsets.UTF_8));
        out.write(("Content-Disposition: form-data; name=\"" + fieldName + "\"; filename=\"" + filename + "\"" + lineBreak).getBytes(StandardCharsets.UTF_8));
        out.write(("Content-Type: " + contentType + lineBreak + lineBreak).getBytes(StandardCharsets.UTF_8));
        out.write(fileBytes);
        out.write(lineBreak.getBytes(StandardCharsets.UTF_8));
        out.write(("--" + boundary + "--" + lineBreak).getBytes(StandardCharsets.UTF_8));
        return out.toByteArray();
    }

    private static String guessContentType(String filename) {
        String lower = filename == null ? "" : filename.toLowerCase();
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        return "image/jpeg";
    }

    public record IdCardScan(boolean success, String message, JsonNode data) {
        public static IdCardScan success(JsonNode data) {
            return new IdCardScan(true, "OK", data);
        }

        public static IdCardScan failure(String message) {
            return new IdCardScan(false, message, null);
        }
    }

    public record FptAiResult(boolean success, boolean missingKey, String message, String payload) {
        public static FptAiResult success(String payload) {
            return new FptAiResult(true, false, "OK", payload);
        }

        public static FptAiResult missingKeyResult() {
            return new FptAiResult(false, true, "Missing FPT_AI_API_KEY environment variable", null);
        }

        public static FptAiResult failure(String message, String payload) {
            return new FptAiResult(false, false, message, payload);
        }
    }
}



