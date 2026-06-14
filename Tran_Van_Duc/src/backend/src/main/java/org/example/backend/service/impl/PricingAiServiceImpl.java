package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.ai.AiConstants;
import org.example.backend.ai.GroqChatClient;
import org.example.backend.ai.GroqChatClient.ChatMessage;
import org.example.backend.ai.PriceContextService;
import org.example.backend.dto.request.PricingChatRequest;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.dto.response.PricingChatResponse;
import org.example.backend.entity.Conversation;
import org.example.backend.entity.Message;
import org.example.backend.entity.User;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.ConversationRepository;
import org.example.backend.repository.MessageRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.PricingAiService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class PricingAiServiceImpl implements PricingAiService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final GroqChatClient groqClient;
    private final PriceContextService priceContextService;

    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý AI hỗ trợ ĐỊNH GIÁ SẢN PHẨM cho người bán (Seller) trên một sàn ĐẤU GIÁ trực tuyến tại Việt Nam.
            Nhiệm vụ của bạn:
            - Giúp người bán xác định MỨC GIÁ KHỞI ĐIỂM hợp lý (đơn vị VNĐ) cho sản phẩm họ muốn đăng đấu giá.
            - Hỏi lại thông tin còn thiếu nếu cần (tên/loại sản phẩm, hãng, tình trạng, năm sản xuất, phụ kiện kèm theo...).
            - Đưa ra một KHOẢNG GIÁ đề xuất kèm giải thích ngắn gọn dựa trên các yếu tố ảnh hưởng tới giá.
            - Nếu có DỮ LIỆU THAM KHẢO từ sàn (được cung cấp bên dưới), hãy ưu tiên dựa vào đó để đề xuất sát thực tế.
            Quy tắc:
            - Trả lời bằng TIẾNG VIỆT, thân thiện, súc tích, có thể dùng gạch đầu dòng.
            - Luôn nhắc rằng đây chỉ là gợi ý tham khảo, giá cuối cùng do người bán quyết định.
            - Chỉ tư vấn trong phạm vi mua bán / định giá sản phẩm; từ chối lịch sự các yêu cầu ngoài phạm vi.
            """;

    @Override
    public PricingChatResponse chat(Long sellerId, PricingChatRequest req) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại: " + sellerId));
        User bot = getOrThrowBot();

        Conversation conv = resolveConversation(req.getConversationId(), seller, bot);

        // 1. Lưu tin nhắn của người bán
        messageRepository.save(Message.builder()
                .conversation(conv).sender(seller).content(req.getMessage()).build());

        // 2. Lấy ngữ cảnh giá từ DB theo nội dung tin nhắn
        String priceContext = priceContextService.buildContext(req.getMessage());

        // 3. Gọi AI (hoặc fallback nếu chưa cấu hình key / lỗi)
        String reply = generateReply(conv, bot, priceContext);

        // 4. Lưu phản hồi của bot
        messageRepository.save(Message.builder()
                .conversation(conv).sender(bot).content(reply).build());

        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        return PricingChatResponse.builder()
                .conversationId(conv.getConversationId())
                .reply(reply)
                .priceContextUsed(!priceContext.isBlank())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long sellerId, Long conversationId) {
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Hội thoại không tồn tại: " + conversationId));
        if (!conv.getUser().getUserId().equals(sellerId)) {
            throw new AccessDeniedException("Bạn không có quyền xem hội thoại này");
        }
        return messageRepository.findByConversation_ConversationIdOrderBySentAtAsc(conversationId)
                .stream().map(this::toMsgResponse).toList();
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private Conversation resolveConversation(Long conversationId, User seller, User bot) {
        if (conversationId == null) {
            return conversationRepository.save(Conversation.builder()
                    .user(seller)
                    .assignedStaff(bot) // đánh dấu đây là hội thoại với AI
                    .subject(AiConstants.CONVERSATION_SUBJECT)
                    .build());
        }
        Conversation conv = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Hội thoại không tồn tại: " + conversationId));
        if (!conv.getUser().getUserId().equals(seller.getUserId())) {
            throw new AccessDeniedException("Bạn không có quyền gửi tin trong hội thoại này");
        }
        return conv;
    }

    private String generateReply(Conversation conv, User bot, String priceContext) {
        if (!groqClient.isEnabled()) {
            return "⚠️ Chatbot AI chưa được cấu hình (thiếu GROQ_API_KEY). "
                    + "Vui lòng đặt biến môi trường GROQ_API_KEY để sử dụng trợ lý định giá.";
        }
        try {
            List<ChatMessage> messages = new ArrayList<>();
            String system = priceContext.isBlank()
                    ? SYSTEM_PROMPT
                    : SYSTEM_PROMPT + "\n\n" + priceContext;
            messages.add(new ChatMessage("system", system));

            List<Message> history = messageRepository
                    .findByConversation_ConversationIdOrderBySentAtAsc(conv.getConversationId());
            int from = Math.max(0, history.size() - AiConstants.MAX_HISTORY);
            for (Message m : history.subList(from, history.size())) {
                String role = m.getSender().getUserId().equals(bot.getUserId()) ? "assistant" : "user";
                messages.add(new ChatMessage(role, m.getContent()));
            }
            return groqClient.complete(messages);
        } catch (Exception e) {
            log.error("Lỗi gọi Groq API: {}", e.getMessage(), e);
            return "Xin lỗi, trợ lý định giá đang gặp sự cố kết nối. Bạn vui lòng thử lại sau ít phút nhé.";
        }
    }

    private User getOrThrowBot() {
        return userRepository.findByUsername(AiConstants.BOT_USERNAME)
                .orElseThrow(() -> new IllegalStateException(
                        "Chưa có tài khoản bot '" + AiConstants.BOT_USERNAME + "'. Hãy khởi động lại để DataSeeder tạo."));
    }

    private MessageResponse toMsgResponse(Message m) {
        return MessageResponse.builder()
                .messageId(m.getMessageId())
                .conversationId(m.getConversation().getConversationId())
                .senderId(m.getSender().getUserId())
                .senderName(m.getSender().getUsername())
                .senderRole(m.getSender().getRole().getRoleName())
                .content(m.getContent())
                .isRead(m.getIsRead())
                .sentAt(m.getSentAt())
                .build();
    }
}
