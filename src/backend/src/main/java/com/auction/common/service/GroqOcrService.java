package com.auction.common.service;

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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GroqOcrService {

    static final String ID_CARD_PROMPT =
            "Bạn là một hệ thống eKYC chuyên nghiệp. Hãy trích xuất thông tin từ ảnh căn cước công dân (CCCD/CMND) Việt Nam này. Trả về kết quả ĐÚNG một chuỗi JSON thuần (không có block markdown ```json), bao gồm chính xác các key sau: 1. full_name: Họ và tên (viết hoa có dấu). 2. id_number: Số CCCD/CMND (chuỗi số). 3. date_of_birth: Ngày tháng năm sinh (Định dạng YYYY-MM-DD). 4. gender: Giới tính (Trả về đúng 1 trong 3 giá trị: 'Male', 'Female', hoặc 'Other'). 5. issue_date: Ngày cấp (Định dạng YYYY-MM-DD). 6. place_of_issue: Nơi cấp. Nếu bất kỳ thông tin nào không xuất hiện trên ảnh, hãy gán giá trị của key đó là null.";

    static final String ID_CARD_PAIR_PROMPT =
            "Bạn là một hệ thống eKYC chuyên nghiệp. Có 2 ảnh: ảnh đầu tiên là MẶT TRƯỚC CCCD/CMND Việt Nam, ảnh thứ hai là MẶT SAU. "
                    + "Trả về ĐÚNG một chuỗi JSON thuần (không có block markdown ```json) với cấu trúc: "
                    + "{\"front\":{\"full_name\":...,\"id_number\":...,\"date_of_birth\":\"YYYY-MM-DD\",\"gender\":\"Male|Female|Other\",\"issue_date\":null,\"place_of_issue\":null},"
                    + "\"back\":{\"full_name\":null,\"id_number\":null,\"date_of_birth\":null,\"gender\":null,\"issue_date\":\"YYYY-MM-DD\",\"place_of_issue\":...}}. "
                    + "Mỗi object con dùng đúng các key: full_name, id_number, date_of_birth, gender, issue_date, place_of_issue. "
                    + "Gán null cho field không có trên ảnh tương ứng.";

    private static final Pattern MARKDOWN_JSON = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);
    private static final String RATE_LIMIT_MESSAGE =
            "Hệ thống OCR đang bận (giới hạn Groq). Bạn có thể điền thông tin thủ công hoặc thử lại sau khoảng 1 phút.";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final GroqKeyPool keyPool;

    @Value("${groq.api.base-url:https://api.groq.com/openai/v1}")
    private String apiBaseUrl;

    @Value("${groq.vision.model:${groq.api.model:qwen/qwen3.6-27b}}")
    private String model;

    public GroqOcrService(
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            @Qualifier("ocr") GroqKeyPool keyPool
    ) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.keyPool = keyPool;
    }

    public String scanIdCard(MultipartFile file) throws IOException {
        validateImage(file, "Ảnh CCCD không được để trống", "Ảnh CCCD không có dữ liệu");
        ImagePayload image = toImagePayload(file);
        return callGroqWithPool(List.of(image), ID_CARD_PROMPT);
    }

    public String scanIdCardPair(MultipartFile frontImage, MultipartFile backImage) throws IOException {
        validateImage(frontImage, "Ảnh mặt trước CCCD không được để trống", "Ảnh mặt trước CCCD không có dữ liệu");
        validateImage(backImage, "Ảnh mặt sau CCCD không được để trống", "Ảnh mặt sau CCCD không có dữ liệu");
        return callGroqWithPool(List.of(toImagePayload(frontImage), toImagePayload(backImage)), ID_CARD_PAIR_PROMPT);
    }

    public JsonNode parseIdCardJson(String json) throws IOException {
        if (json == null || json.isBlank()) {
            throw new IllegalArgumentException("Groq không trả về dữ liệu JSON");
        }
        return objectMapper.readTree(normalizeJsonText(json));
    }

    public JsonNode parseDualIdCardJson(String json) throws IOException {
        JsonNode root = parseIdCardJson(json);
        if (root.has("front") || root.has("back")) {
            return root;
        }
        Map<String, Object> wrapped = new LinkedHashMap<>();
        wrapped.put("front", objectMapper.convertValue(root, Map.class));
        wrapped.put("back", Map.of());
        return objectMapper.valueToTree(wrapped);
    }

    private String callGroqWithPool(List<ImagePayload> images, String prompt) {
        if (!keyPool.isConfigured()) {
            throw new IllegalStateException(
                    "Chưa cấu hình GROQ_API_KEY hoặc GROQ_OCR_API_KEY");
        }

        try {
            return keyPool.executeWithPool(apiKey -> invokeGroq(apiKey, images, prompt));
        } catch (HttpStatusCodeException ex) {
            if (ex.getStatusCode().value() == 429) {
                throw new IllegalStateException(RATE_LIMIT_MESSAGE, ex);
            }
            String body = ex.getResponseBodyAsString(StandardCharsets.UTF_8);
            throw new IllegalStateException("Groq API HTTP " + ex.getStatusCode().value() + ": " + body, ex);
        } catch (IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Gọi Groq OCR thất bại: " + ex.getMessage(), ex);
        }
    }

    private String invokeGroq(String apiKey, List<ImagePayload> images, String prompt) {
        Map<String, Object> requestBody = buildRequestBody(images, prompt);
        String url = apiBaseUrl.replaceAll("/+$", "") + "/chat/completions";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey.trim());
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            String text = extractGeneratedText(root);
            return normalizeJsonText(text);
        } catch (IOException ex) {
            throw new IllegalStateException("Không đọc được phản hồi Groq OCR", ex);
        }
    }

    private Map<String, Object> buildRequestBody(List<ImagePayload> images, String prompt) {
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(Map.of("type", "text", "text", prompt));
        for (ImagePayload image : images) {
            Map<String, Object> imagePart = new LinkedHashMap<>();
            imagePart.put("type", "image_url");
            imagePart.put("image_url", Map.of(
                    "url", "data:" + image.mimeType() + ";base64," + image.base64()
            ));
            parts.add(imagePart);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model.trim());
        body.put("messages", List.of(Map.of("role", "user", "content", parts)));
        body.put("temperature", 0);
        body.put("max_completion_tokens", 1500);
        body.put("reasoning_effort", "none");
        body.put("reasoning_format", "hidden");
        body.put("response_format", Map.of("type", "json_object"));
        return body;
    }

    private static String extractGeneratedText(JsonNode root) {
        if (root == null || root.isMissingNode()) {
            throw new IllegalStateException("Groq trả về response rỗng");
        }
        JsonNode error = root.path("error");
        if (!error.isMissingNode() && !error.isNull()) {
            String message = error.path("message").asText("Groq API error");
            throw new IllegalStateException(message);
        }
        JsonNode textNode = root.path("choices").path(0).path("message").path("content");
        if (textNode.isMissingNode() || textNode.isNull() || textNode.asText("").isBlank()) {
            throw new IllegalStateException("Groq không trả về nội dung nhận dạng");
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

    private static void validateImage(MultipartFile file, String emptyMessage, String noDataMessage) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(emptyMessage);
        }
        if (file.getBytes().length == 0) {
            throw new IllegalArgumentException(noDataMessage);
        }
    }

    private static ImagePayload toImagePayload(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        return new ImagePayload(Base64.getEncoder().encodeToString(bytes), resolveMimeType(file));
    }

    private static String resolveMimeType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType != null && !contentType.isBlank()) {
            return contentType;
        }
        String name = file.getOriginalFilename();
        if (name != null && name.toLowerCase().endsWith(".png")) {
            return "image/png";
        }
        if (name != null && name.toLowerCase().endsWith(".webp")) {
            return "image/webp";
        }
        return "image/jpeg";
    }

    private record ImagePayload(String base64, String mimeType) {
    }
}
