package com.auction.account.service;

import com.auction.account.util.FptAiConfig;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

public class FptAiService {
    private final HttpClient httpClient;

    public FptAiService() {
        this(HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build());
    }

    public FptAiService(HttpClient httpClient) {
        this.httpClient = httpClient;
    }

    public FptAiResult healthCheck() {
        String apiKey = FptAiConfig.getApiKey();
        if (apiKey == null) {
            return FptAiResult.missingKey();
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

    public record FptAiResult(boolean success, boolean missingKey, String message, String payload) {
        public static FptAiResult success(String payload) {
            return new FptAiResult(true, false, "OK", payload);
        }

        public static FptAiResult missingKey() {
            return new FptAiResult(false, true, "Missing FPT_AI_API_KEY environment variable", null);
        }

        public static FptAiResult failure(String message, String payload) {
            return new FptAiResult(false, false, message, payload);
        }
    }
}



