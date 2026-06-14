package org.example.backend.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Client gọi Groq API (chuẩn OpenAI Chat Completions).
 * Doc: https://console.groq.com/docs/api-reference#chat-create
 */
@Component
@Slf4j
public class GroqChatClient {

    public record ChatMessage(String role, String content) {}

    private final RestClient rest;
    private final String model;
    private final double temperature;
    private final int maxTokens;
    private final String reasoningFormat;
    private final boolean enabled;

    public GroqChatClient(
            @Value("${groq.api.base-url:https://api.groq.com/openai/v1}") String baseUrl,
            @Value("${groq.api.key:}") String apiKey,
            @Value("${groq.api.model:llama-3.3-70b-versatile}") String model,
            @Value("${groq.api.temperature:0.4}") double temperature,
            @Value("${groq.api.max-tokens:1024}") int maxTokens,
            @Value("${groq.api.reasoning-format:}") String reasoningFormat) {

        this.model = model;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.reasoningFormat = reasoningFormat;
        this.enabled = apiKey != null && !apiKey.isBlank();

        this.rest = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Authorization", "Bearer " + (apiKey == null ? "" : apiKey.trim()))
                .build();

        if (!enabled) {
            log.warn("GROQ_API_KEY chưa được cấu hình -> Chatbot AI sẽ trả lời ở chế độ fallback.");
        }
    }

    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Gửi danh sách tin nhắn cho Groq và trả về nội dung phản hồi của trợ lý.
     */
    public String complete(List<ChatMessage> messages) {
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("model", model);
        body.put("temperature", temperature);
        body.put("max_tokens", maxTokens);
        body.put("messages", messages.stream()
                .map(m -> Map.of("role", m.role(), "content", m.content()))
                .toList());
        if (reasoningFormat != null && !reasoningFormat.isBlank()) {
            body.put("reasoning_format", reasoningFormat);
        }

        GroqResponse resp = rest.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(GroqResponse.class);

        if (resp == null || resp.choices() == null || resp.choices().isEmpty()
                || resp.choices().get(0).message() == null) {
            throw new IllegalStateException("Groq trả về phản hồi rỗng");
        }
        return resp.choices().get(0).message().content();
    }

    // ─── DTO phản hồi Groq ──────────────────────────────────────────────
    @JsonIgnoreProperties(ignoreUnknown = true)
    record GroqResponse(List<Choice> choices) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Choice(Msg message) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Msg(String role, String content) {}
}
