package com.auction.common.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiOcrService {

    static final String ID_CARD_PROMPT =
            "Bạn là một hệ thống eKYC chuyên nghiệp. Hãy trích xuất thông tin từ ảnh căn cước công dân (CCCD/CMND) Việt Nam này. Trả về kết quả ĐÚNG một chuỗi JSON thuần (không có block markdown ```json), bao gồm chính xác các key sau: 1. full_name: Họ và tên (viết hoa có dấu). 2. id_number: Số CCCD/CMND (chuỗi số). 3. date_of_birth: Ngày tháng năm sinh (Định dạng YYYY-MM-DD). 4. gender: Giới tính (Trả về đúng 1 trong 3 giá trị: 'Male', 'Female', hoặc 'Other'). 5. issue_date: Ngày cấp (Định dạng YYYY-MM-DD). 6. place_of_issue: Nơi cấp. Nếu bất kỳ thông tin nào không xuất hiện trên ảnh, hãy gán giá trị của key đó là null.";

    private static final Pattern MARKDOWN_JSON = Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String apiBaseUrl;

    @Value("${gemini.api.model:gemini-2.5-flash}")
    private String model;

    public GeminiOcrService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Sends one CCCD image to Gemini and returns the extracted JSON string.
     */
    public String scanIdCard(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Ảnh CCCD không được để trống");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Chưa cấu hình gemini.api.key trong application.properties");
        }

        byte[] bytes = file.getBytes();
        if (bytes.length == 0) {
            throw new IllegalArgumentException("Ảnh CCCD không có dữ liệu");
        }

        String base64 = Base64.getEncoder().encodeToString(bytes);
        String mimeType = resolveMimeType(file);

        Map<String, Object> requestBody = buildRequestBody(base64, mimeType);
        String url = apiBaseUrl + "/models/" + model.trim() + ":generateContent?key=" + apiKey.trim();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            String text = extractGeneratedText(root);
            return normalizeJsonText(text);
        } catch (HttpStatusCodeException ex) {
            if (ex.getStatusCode().value() == 429) {
                throw new IllegalStateException(
                        "Hệ thống OCR đang bận (giới hạn Gemini). Bạn có thể điền thông tin thủ công hoặc thử lại sau khoảng 1 phút.",
                        ex);
            }
            String body = ex.getResponseBodyAsString(StandardCharsets.UTF_8);
            throw new IllegalStateException("Gemini API HTTP " + ex.getStatusCode().value() + ": " + body, ex);
        } catch (IOException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Gọi Gemini OCR thất bại: " + ex.getMessage(), ex);
        }
    }

    /**
     * Parses the JSON string returned by {@link #scanIdCard(MultipartFile)}.
     */
    public JsonNode parseIdCardJson(String json) throws IOException {
        if (json == null || json.isBlank()) {
            throw new IllegalArgumentException("Gemini không trả về dữ liệu JSON");
        }
        return objectMapper.readTree(normalizeJsonText(json));
    }

    private Map<String, Object> buildRequestBody(String base64Image, String mimeType) {
        Map<String, Object> inlineData = new LinkedHashMap<>();
        inlineData.put("mime_type", mimeType);
        inlineData.put("data", base64Image);

        Map<String, Object> imagePart = new LinkedHashMap<>();
        imagePart.put("inline_data", inlineData);

        Map<String, Object> textPart = Map.of("text", ID_CARD_PROMPT);

        Map<String, Object> content = new LinkedHashMap<>();
        content.put("parts", List.of(textPart, imagePart));

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("contents", List.of(content));
        return body;
    }

    private static String extractGeneratedText(JsonNode root) {
        if (root == null || root.isMissingNode()) {
            throw new IllegalStateException("Gemini trả về response rỗng");
        }
        JsonNode error = root.path("error");
        if (!error.isMissingNode() && !error.isNull()) {
            String message = error.path("message").asText("Gemini API error");
            throw new IllegalStateException(message);
        }
        JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
        if (textNode.isMissingNode() || textNode.isNull() || textNode.asText("").isBlank()) {
            throw new IllegalStateException("Gemini không trả về nội dung nhận dạng");
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
}
