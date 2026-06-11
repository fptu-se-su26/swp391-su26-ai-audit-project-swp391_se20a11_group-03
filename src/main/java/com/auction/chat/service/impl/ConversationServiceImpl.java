package com.auction.chat.service.impl;

import lombok.RequiredArgsConstructor;
import com.auction.chat.dto.request.CreateConversationRequest;
import com.auction.chat.dto.response.ConversationDetailResponse;
import com.auction.chat.dto.response.ConversationResponse;
import com.auction.chat.dto.response.MessageResponse;
import com.auction.chat.entity.Conversation;
import com.auction.chat.entity.Message;
import com.auction.account.entity.User;
import com.auction.chat.enums.ConversationStatus;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.chat.repository.ConversationRepository;
import com.auction.chat.repository.MessageRepository;
import com.auction.account.dao.UserRepository;
import com.auction.chat.service.ConversationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public ConversationResponse createConversation(Long userId, CreateConversationRequest req) {
        User user = userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại: " + userId));

        Conversation conv = conversationRepository.save(
                Conversation.builder().user(user).subject(req.getSubject()).build());

        messageRepository.save(Message.builder()
                .conversation(conv).sender(user).content(req.getFirstMessage()).build());

        ConversationResponse response = toResponse(conv, userId);
        messagingTemplate.convertAndSend("/topic/staff/new-conversation", response);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getMyConversations(Long userId) {
        return conversationRepository.findByUser_IdOrderByUpdatedAtDesc(Math.toIntExact(userId))
                .stream().map(c -> toResponse(c, userId)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversationsAssignedToStaff(Long staffId) {
        return conversationRepository.findByAssignedStaff_IdOrderByUpdatedAtDesc(Math.toIntExact(staffId))
                .stream().map(c -> toResponse(c, staffId)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getUnassignedConversations() {
        return conversationRepository
                .findByAssignedStaffIsNullAndStatusNotOrderByCreatedAtAsc(ConversationStatus.CLOSED)
                .stream().map(c -> toResponse(c, 0L)).toList();
    }

    @Override
    public ConversationResponse assignConversationToStaff(Long conversationId, Long staffId) {
        Conversation conv = findConvOrThrow(conversationId);
        User staff = userRepository.findById(Math.toIntExact(staffId))
                .orElseThrow(() -> new ResourceNotFoundException("Staff không tồn tại: " + staffId));

        conv.setAssignedStaff(staff);
        conv.setStatus(ConversationStatus.IN_PROGRESS);
        conv = conversationRepository.save(conv);

        ConversationResponse response = toResponse(conv, staffId);
        messagingTemplate.convertAndSendToUser(
                conv.getUser().getUserId().toString(),
                "/queue/conversation-assigned",
                response);
        return response;
    }

    @Override
    public ConversationResponse closeConversation(Long conversationId, Long actorId) {
        Conversation conv = findConvOrThrow(conversationId);
        conv.setStatus(ConversationStatus.CLOSED);
        return toResponse(conversationRepository.save(conv), actorId);
    }

    @Override
    public ConversationDetailResponse getConversationDetail(Long conversationId, Long requesterId) {
        Conversation conv = findConvOrThrow(conversationId);
        validateAccess(conv, requesterId);
        messageRepository.markAllAsRead(conversationId, Math.toIntExact(requesterId));

        List<MessageResponse> messages = messageRepository
                .findByConversation_ConversationIdOrderBySentAtAsc(conversationId)
                .stream().map(this::toMsgResponse).toList();

        return ConversationDetailResponse.builder()
                .info(toResponse(conv, requesterId))
                .messages(messages)
                .build();
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private Conversation findConvOrThrow(Long id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation không tồn tại: " + id));
    }

    private void validateAccess(Conversation conv, Long requesterId) {
        boolean isOwner = conv.getUser().getUserId().equals(requesterId);
        boolean isStaff = conv.getAssignedStaff() != null
                && conv.getAssignedStaff().getUserId().equals(requesterId);
        if (!isOwner && !isStaff) {
            throw new AccessDeniedException("Bạn không có quyền xem conversation này");
        }
    }

    private ConversationResponse toResponse(Conversation c, Long requesterId) {
        String lastMsg = messageRepository
                .findTopByConversation_ConversationIdOrderBySentAtDesc(c.getConversationId())
                .map(Message::getContent).orElse(null);
        int unread = (requesterId > 0)
                ? messageRepository.countUnread(c.getConversationId(), Math.toIntExact(requesterId))
                : 0;

        return ConversationResponse.builder()
                .conversationId(c.getConversationId())
                .userId(c.getUser().getUserId())
                .userName(c.getUser().getUsername())
                .assignedStaffId(c.getAssignedStaff() != null ? c.getAssignedStaff().getUserId() : null)
                .assignedStaffName(c.getAssignedStaff() != null ? c.getAssignedStaff().getUsername() : null)
                .subject(c.getSubject())
                .status(c.getStatus().name())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .lastMessage(lastMsg)
                .unreadCount(unread)
                .build();
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

