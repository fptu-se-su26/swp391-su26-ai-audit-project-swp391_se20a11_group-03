package org.example.backend.service;

import org.example.backend.dto.request.PricingChatRequest;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.dto.response.PricingChatResponse;

import java.util.List;

public interface PricingAiService {

    /** Gửi tin nhắn tới trợ lý định giá AI; tạo hội thoại mới nếu chưa có. */
    PricingChatResponse chat(Long sellerId, PricingChatRequest request);

    /** Lấy lịch sử tin nhắn của một hội thoại AI (để tải lại khi mở widget). */
    List<MessageResponse> getMessages(Long sellerId, Long conversationId);
}
