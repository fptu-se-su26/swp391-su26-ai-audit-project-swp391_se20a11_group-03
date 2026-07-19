package com.auction.chat.service.impl;

import lombok.RequiredArgsConstructor;
import com.auction.chat.dto.request.SendMessageRequest;
import com.auction.chat.dto.response.MessageResponse;
import com.auction.chat.entity.Conversation;
import com.auction.chat.entity.Message;
import com.auction.account.entity.User;
import com.auction.chat.enums.ConversationStatus;
import com.auction.chat.enums.ConversationType;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.chat.repository.ConversationRepository;
import com.auction.chat.repository.MessageRepository;
import com.auction.account.dao.UserRepository;
import com.auction.chat.service.MessageService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public MessageResponse sendMessage(Long senderId, SendMessageRequest req) {
        Conversation conv = conversationRepository.findById(req.getConversationId())
                .orElseThrow(() -> new ResourceNotFoundException("Conversation không tồn tại"));

        if (conv.getStatus() == ConversationStatus.CLOSED) {
            throw new IllegalStateException("Conversation đã đóng, không thể gửi tin nhắn");
        }

        User sender = userRepository.findById(Math.toIntExact(senderId))
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
        validateSenderAccess(conv, sender);

        Message msg = messageRepository.save(
                Message.builder().conversation(conv).sender(sender).content(req.getContent()).build());

        conv.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conv);

        MessageResponse response = toResponse(msg);
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conv.getConversationId(), response);
        return response;
    }

    /**
     * Phân quyền gửi tin nhắn:
     * <ul>
     *   <li>Admin: được gửi trong mọi conversation (giám sát + phản hồi người dùng).</li>
     *   <li>BUYER_SELLER: buyer hoặc seller. Staff không gửi được.</li>
     *   <li>BUYER_STAFF / SELLER_STAFF: creator hoặc assigned staff.</li>
     * </ul>
     */
    private void validateSenderAccess(Conversation conv, User sender) {
        if (conv.getType() == ConversationType.BUYER_SELLER) {
            throw new AccessDeniedException(
                    "Legacy buyer-seller conversations are read-only. Please contact staff for support.");
        }
        String role = sender.getRole().getRoleName();
        if ("Admin".equalsIgnoreCase(role)) {
            return;
        }
        if (conv.getType() == ConversationType.BUYER_SELLER) {
            if ("Staff".equalsIgnoreCase(role)) {
                throw new AccessDeniedException("Staff không thể gửi tin nhắn trong cuộc hội thoại buyer ↔ seller");
            }
            boolean isBuyer = conv.getUser().getId() == sender.getId();
            boolean isSeller = conv.getSeller() != null && conv.getSeller().getId() == sender.getId();
            if (!isBuyer && !isSeller) {
                throw new AccessDeniedException("Bạn không phải thành viên của conversation này");
            }
        } else {
            boolean isCreator = conv.getUser().getId() == sender.getId();
            boolean isAssignedStaff = conv.getAssignedStaff() != null
                    && conv.getAssignedStaff().getId() == sender.getId();
            if (!isCreator && !isAssignedStaff) {
                throw new AccessDeniedException("Bạn không phải thành viên của conversation này");
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long conversationId, Long requesterId) {
        return messageRepository
                .findByConversation_ConversationIdOrderBySentAtAsc(conversationId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public void markAsRead(Long conversationId, Long userId) {
        messageRepository.markAllAsRead(conversationId, Math.toIntExact(userId));
    }

    private MessageResponse toResponse(Message m) {
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
