package com.auction.product.service;

import com.auction.common.service.GroqKeyPool;
import com.auction.product.dto.AiValuationRequest;
import com.auction.product.dto.AiValuationResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GroqValuationService {

    private static final int MAX_IMAGES = 3;
    private static final Pattern MARKDOWN_JSON = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);

    private static final String RATE_LIMIT_MESSAGE =
            "Groq đang bận (giới hạn request). Thử lại sau khoảng 1 phút.";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final GroqKeyPool keyPool;

    @Value("${groq.api.base-url:https://api.groq.com/openai/v1}")
    private String apiBaseUrl;

    @Value("${groq.vision.model:${groq.api.model:qwen/qwen3.6-27b}}")
    private String model;

    public GroqValuationService(
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            @Qualifier("valuation") GroqKeyPool keyPool
    ) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.keyPool = keyPool;
    }

    public AiValuationResponse value(AiValuationRequest request) {
        if (!keyPool.isConfigured()) {
            throw new IllegalStateException(
                    "Chưa cấu hình GROQ_API_KEY hoặc GROQ_VALUATION_API_KEY.");
        }
        if (request == null) {
            throw new IllegalArgumentException("Thiếu dữ liệu định giá");
        }
        String description = request.getDescription() != null ? request.getDescription().trim() : "";
        if (description.isBlank() && (request.getMessage() == null || request.getMessage().isBlank())) {
            throw new IllegalArgumentException("Cần mô tả sản phẩm hoặc câu hỏi để định giá");
        }

        Map<String, Object> body = buildRequestBody(request);

        try {
            return keyPool.executeWithPool(apiKey -> invokeValuation(apiKey, body));
        } catch (HttpStatusCodeException ex) {
            if (ex.getStatusCode().value() == 429) {
                throw new IllegalStateException(RATE_LIMIT_MESSAGE, ex);
            }
            String errBody = ex.getResponseBodyAsString(StandardCharsets.UTF_8);
            throw new IllegalStateException("Groq API HTTP " + ex.getStatusCode().value() + ": " + errBody, ex);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Gọi Groq định giá thất bại: " + ex.getMessage(), ex);
        }
    }

    private AiValuationResponse invokeValuation(String apiKey, Map<String, Object> body) {
        String url = apiBaseUrl.replaceAll("/+$", "") + "/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey.trim());
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            String text = extractGeneratedText(root);
            return parseValuation(text);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Gọi Groq định giá thất bại: " + ex.getMessage(), ex);
        }
    }

    private Map<String, Object> buildRequestBody(AiValuationRequest request) {
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("type", "text", "text", buildPrompt(request)));

        List<AiValuationRequest.AiValuationImage> images = request.getImages();
        if (images != null) {
            int count = 0;
            for (AiValuationRequest.AiValuationImage image : images) {
                if (image == null || image.getBase64() == null || image.getBase64().isBlank()) {
                    continue;
                }
                if (count >= MAX_IMAGES) {
                    break;
                }
                String raw = stripDataUrl(image.getBase64());
                String mime = resolveMime(image.getMimeType(), raw);
                Map<String, Object> imagePart = new LinkedHashMap<>();
                imagePart.put("type", "image_url");
                imagePart.put("image_url", Map.of(
                        "url", "data:" + mime + ";base64," + raw
                ));
                parts.add(imagePart);
                count++;
            }
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model.trim());
        body.put("messages", List.of(Map.of("role", "user", "content", parts)));
        body.put("temperature", 0.2);
        body.put("max_completion_tokens", 1500);
        body.put("reasoning_effort", "none");
        body.put("reasoning_format", "hidden");
        body.put("response_format", Map.of("type", "json_object"));
        return body;
    }

    private String buildPrompt(AiValuationRequest request) {
        String name = blankToDash(request.getProductName());
        String description = blankToDash(request.getDescription());
        String starting = request.getStartingPrice() != null ? String.valueOf(request.getStartingPrice()) : "chưa có";
        String userMessage = request.getMessage() != null && !request.getMessage().isBlank()
                ? request.getMessage().trim()
                : "Hãy định giá sản phẩm này cho phiên đấu giá.";

        return """
                Bạn là chuyên gia định giá đồ đấu giá luxury tại Việt Nam (đồng hồ, trang sức, nghệ thuật, xe cổ, đồ sưu tầm).
                Dựa trên tên, mô tả, giá khởi điểm (nếu có) và ảnh đính kèm (nếu có), hãy ước tính khoảng giá thị trường hợp lý bằng VND.

                Trả về ĐÚNG một JSON thuần (không markdown), với các key:
                - reply: chuỗi tiếng Việt, 2-5 câu, giải thích ngắn gọn cho người bán (có thể dùng số có dấu chấm ngăn cách hàng nghìn).
                - summary: một dòng tóm tắt khoảng giá VND.
                - lowEstimate: số nguyên VND (không dấu phẩy).
                - highEstimate: số nguyên VND (không dấu phẩy).
                - currency: luôn là "VND".

                Nếu thông tin thiếu, vẫn đưa khoảng ước lượng thận trọng và nêu rõ giả định trong reply.
                Không bịa số liệu so sánh cụ thể nếu không chắc; nói "ước tính dựa trên mô tả/ảnh".

                Tên sản phẩm: %s
                Mô tả: %s
                Giá khởi điểm người bán đề xuất (VND): %s
                Câu hỏi / yêu cầu của người bán: %s
                """.formatted(name, description, starting, userMessage);
    }

    private AiValuationResponse parseValuation(String rawText) {
        String json = normalizeJsonText(rawText);
        try {
            JsonNode node = objectMapper.readTree(json);
            String reply = textOrNull(node, "reply");
            String summary = textOrNull(node, "summary");
            Long low = longOrNull(node, "lowEstimate");
            Long high = longOrNull(node, "highEstimate");
            String currency = textOrNull(node, "currency");
            if (currency == null || currency.isBlank()) {
                currency = "VND";
            }
            if (summary == null || summary.isBlank()) {
                if (low != null && high != null) {
                    summary = "Ước tính: " + formatVnd(low) + " – " + formatVnd(high) + " VND";
                } else if (reply != null) {
                    summary = reply.length() > 160 ? reply.substring(0, 157) + "…" : reply;
                } else {
                    summary = "Đã nhận phản hồi định giá từ AI.";
                }
            }
            if (reply == null || reply.isBlank()) {
                reply = summary;
            }
            return AiValuationResponse.builder()
                    .reply(reply)
                    .summary(summary)
                    .lowEstimate(low)
                    .highEstimate(high)
                    .currency(currency)
                    .build();
        } catch (Exception parseEx) {
            // Model sometimes returns plain text — still usable in chat.
            String fallback = rawText != null ? rawText.trim() : "Không phân tích được phản hồi AI.";
            return AiValuationResponse.builder()
                    .reply(fallback)
                    .summary(fallback.length() > 160 ? fallback.substring(0, 157) + "…" : fallback)
                    .currency("VND")
                    .build();
        }
    }

    private static String extractGeneratedText(JsonNode root) {
        if (root == null || root.isMissingNode()) {
            throw new IllegalStateException("Groq trả về response rỗng");
        }
        JsonNode error = root.path("error");
        if (!error.isMissingNode() && !error.isNull()) {
            throw new IllegalStateException(error.path("message").asText("Groq API error"));
        }
        JsonNode textNode = root.path("choices").path(0).path("message").path("content");
        if (textNode.isMissingNode() || textNode.isNull() || textNode.asText("").isBlank()) {
            throw new IllegalStateException("Groq không trả về nội dung định giá");
        }
        return textNode.asText().trim();
    }

    static String normalizeJsonText(String raw) {
        if (raw == null) {
            return "";
        }
        String trimmed = raw.trim();
        Matcher matcher = MARKDOWN_JSON.matcher(trimmed);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return trimmed;
    }

    private static String stripDataUrl(String base64) {
        String value = base64.trim();
        int comma = value.indexOf(',');
        if (value.toLowerCase(Locale.ROOT).startsWith("data:") && comma > 0) {
            return value.substring(comma + 1);
        }
        return value;
    }

    private static String resolveMime(String mimeType, String base64) {
        if (mimeType != null && !mimeType.isBlank()) {
            return mimeType.trim();
        }
        // Heuristic from common prefixes is unnecessary; default jpeg.
        return "image/jpeg";
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode child = node.path(field);
        if (child.isMissingNode() || child.isNull()) {
            return null;
        }
        String text = child.asText(null);
        return text != null && !text.isBlank() ? text.trim() : null;
    }

    private static Long longOrNull(JsonNode node, String field) {
        JsonNode child = node.path(field);
        if (child.isMissingNode() || child.isNull()) {
            return null;
        }
        if (child.isNumber()) {
            return child.asLong();
        }
        String text = child.asText("").replaceAll("[^0-9]", "");
        if (text.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(text);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String blankToDash(String value) {
        return value == null || value.isBlank() ? "(chưa có)" : value.trim();
    }

    private static String formatVnd(long amount) {
        return String.format(Locale.GERMAN, "%,d", amount).replace('\u00A0', '.');
    }
}
