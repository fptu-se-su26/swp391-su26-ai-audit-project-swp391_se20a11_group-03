package org.example.backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.CreateConversationRequest;
import org.example.backend.dto.response.ConversationDetailResponse;
import org.example.backend.dto.response.ConversationResponse;
import org.example.backend.dto.response.MessageResponse;
import org.example.backend.entity.Conversation;
import org.example.backend.entity.Message;
import org.example.backend.entity.User;
import org.example.backend.enums.ConversationStatus;
import org.example.backend.exception.ResourceNotFoundException;
import org.example.backend.repository.ConversationRepository;
import org.example.backend.repository.MessageRepository;
import org.example.backend.repository.UserRepository;
import org.example.backend.service.ConversationService;
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
        User user = userRepository.findById(userId)
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
        return conversationRepository
                .findHumanConversationsByUser(userId, org.example.backend.ai.AiConstants.BOT_USERNAME)
                .stream().map(c -> toResponse(c, userId)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversationsAssignedToStaff(Long staffId) {
        return conversationRepository.findByAssignedStaff_UserIdOrderByUpdatedAtDesc(staffId)
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
        User staff = userRepository.findById(staffId)
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
        messageRepository.markAllAsRead(conversationId, requesterId);

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
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại: " + requesterId));
        String role = requester.getRole().getRoleName();

        if ("Admin".equals(role)) {
            return; // Admin can view all
        }
        if ("Staff".equals(role)) {
            boolean isAssignedToMe = conv.getAssignedStaff() != null
                    && conv.getAssignedStaff().getUserId().equals(requesterId);
            boolean isUnassigned = conv.getAssignedStaff() == null;
            if (isAssignedToMe || isUnassigned) {
                return; // Staff can view unassigned or their own assigned conversations
            }
        }
        if (conv.getUser().getUserId().equals(requesterId)) {
            return; // Owner can view their own
        }
        throw new AccessDeniedException("Bạn không có quyền xem conversation này");
    }

    private ConversationResponse toResponse(Conversation c, Long requesterId) {
        String lastMsg = messageRepository
                .findTopByConversation_ConversationIdOrderBySentAtDesc(c.getConversationId())
                .map(Message::getContent).orElse(null);
        int unread = (requesterId > 0)
                ? messageRepository.countUnread(c.getConversationId(), requesterId)
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
