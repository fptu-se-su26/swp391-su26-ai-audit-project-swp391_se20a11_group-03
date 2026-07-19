package com.auction.common.service;

import com.auction.common.dto.ChatbotResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@Slf4j
public class BidZoneChatbotService {

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý hỗ trợ khách hàng của BidZone, một nền tảng đấu giá trực tuyến tại Việt Nam.
            Trả lời bằng tiếng Việt, thân thiện, ngắn gọn tối đa 5 câu.
            Chỉ hướng dẫn về tài khoản, KYC, ví, tiền cọc, đấu giá, thanh toán, ký gửi, sản phẩm và hỗ trợ trên BidZone.
            Không bịa dữ liệu tài khoản, số dư, trạng thái phiên hoặc chính sách chưa được cung cấp.
            Khi cần dữ liệu cá nhân, hướng dẫn người dùng đăng nhập và mở đúng trang trong hệ thống.

            Tin nhắn người dùng: %s
            """;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final GroqKeyPool keyPool;

    @Value("${groq.api.base-url:https://api.groq.com/openai/v1}")
    private String apiBaseUrl;

    @Value("${groq.api.model:qwen/qwen3.6-27b}")
    private String model;

    public BidZoneChatbotService(
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            @Qualifier("chat") GroqKeyPool keyPool
    ) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.keyPool = keyPool;
    }

    public ChatbotResponse reply(String message) {
        String trimmed = message == null ? "" : message.trim();
        if (keyPool.isConfigured()) {
            try {
                String answer = keyPool.executeWithPool(apiKey -> invokeGroq(apiKey, trimmed));
                return new ChatbotResponse(answer, true);
            } catch (Exception ex) {
                log.warn("Groq chatbot unavailable, using local support fallback: {}", ex.getMessage());
            }
        }
        return new ChatbotResponse(localReply(trimmed), false);
    }

    private String invokeGroq(String apiKey, String message) {
        String url = apiBaseUrl.replaceAll("/+$", "") + "/chat/completions";
        Map<String, Object> body = Map.of(
                "model", model.trim(),
                "messages", List.of(Map.of(
                        "role", "user",
                        "content", SYSTEM_PROMPT.formatted(message)
                )),
                "temperature", 0.3,
                "max_completion_tokens", 300,
                "reasoning_effort", "none",
                "reasoning_format", "hidden"
        );
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey.trim());
        String raw = restTemplate.postForObject(url, new HttpEntity<>(body, headers), String.class);
        try {
            JsonNode root = objectMapper.readTree(raw);
            String text = root.path("choices").path(0).path("message").path("content").asText("").trim();
            if (text.isBlank()) {
                throw new IllegalStateException("Groq không trả về nội dung");
            }
            return text;
        } catch (Exception ex) {
            throw new IllegalStateException("Không đọc được phản hồi chatbot", ex);
        }
    }

    private String localReply(String message) {
        String normalized = normalize(message);
        if (normalized.matches("^(alo|hello|hi|xin chao|chao|chao ban)[!?. ]*$")) {
            return "Chào bạn! Mình có thể hướng dẫn về đấu giá, KYC, ví, thanh toán hoặc ký gửi sản phẩm trên BidZone.";
        }
        if (containsAny(normalized, "kyc", "xac minh", "can cuoc", "cccd")) {
            return "Bạn mở mục KYC trong tài khoản, tải ảnh CCCD mặt trước và mặt sau rồi gửi xét duyệt. Trạng thái xác minh sẽ được cập nhật ngay trên trang KYC.";
        }
        if (containsAny(normalized, "nap tien", "rut tien", "so du", "vi bidzone", "wallet")) {
            return "Bạn mở Ví BidZone để xem số dư, lịch sử giao dịch, nạp hoặc rút tiền. Các giao dịch và số dư hiển thị trực tiếp từ tài khoản của bạn.";
        }
        if (containsAny(normalized, "dat coc", "tien coc", "tham gia", "tra gia", "dau gia", "bid")) {
            return "Để tham gia đấu giá, bạn cần đăng nhập, hoàn tất KYC và đặt cọc cho phiên. Sau đó mở trang chi tiết phiên để xem giá tối thiểu tiếp theo và gửi mức giá của bạn.";
        }
        if (containsAny(normalized, "thanh toan", "da thang", "trung dau gia", "won")) {
            return "Các phiên bạn thắng nằm trong mục Đã thắng. Nếu phiên đang chờ thanh toán, hãy mở chi tiết phiên và hoàn tất trước thời hạn hiển thị.";
        }
        if (containsAny(normalized, "ky gui", "dang san pham", "ban san pham", "nguoi ban")) {
            return "Bạn vào Kho vật phẩm hoặc Đăng vật phẩm, nhập thông tin và ảnh sản phẩm rồi gửi duyệt. Sau khi staff phê duyệt, sản phẩm mới có thể được lên lịch đấu giá.";
        }
        if (containsAny(normalized, "nhan vien", "tu van", "khieu nai", "ho tro")) {
            return "Bạn mở mục Tin nhắn để tạo hoặc tiếp tục hội thoại với đội ngũ hỗ trợ. Nhân viên sẽ xem nội dung và phản hồi trong cuộc hội thoại của bạn.";
        }
        return "Mình chưa xác định được yêu cầu. Bạn có thể hỏi về KYC, cách tham gia đấu giá, tiền cọc, ví, thanh toán hoặc ký gửi sản phẩm.";
    }

    private static boolean containsAny(String value, String... terms) {
        for (String term : terms) {
            if (value.contains(term)) return true;
        }
        return false;
    }

    private static String normalize(String value) {
        String decomposed = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD);
        return decomposed.replaceAll("\\p{M}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .toLowerCase(Locale.ROOT);
    }
}
