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
import com.auction.chat.enums.ConversationType;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.chat.repository.ConversationRepository;
import com.auction.chat.repository.MessageRepository;
import com.auction.account.dao.UserRepository;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import com.auction.chat.service.ConversationService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ConversationServiceImpl implements ConversationService {

    private static final Logger log = LoggerFactory.getLogger(ConversationServiceImpl.class);

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public ConversationResponse createConversation(Long userId, CreateConversationRequest req) {
        log.info("createConversation userId={} type={} subject={}", userId, req.getType(), req.getSubject());
        try {
            User user = userRepository.findById(Math.toIntExact(userId))
                    .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại: " + userId));

            ConversationType type = parseType(req.getType());
            validateCreatorRole(user, type);

            Conversation conv;
            switch (type) {
                case BUYER_SELLER -> throw new IllegalArgumentException(
                        "Direct buyer-seller chat is disabled. Please contact staff for support.");
                case BUYER_STAFF, SELLER_STAFF -> conv = createStaffSupport(user, type);
                default -> throw new IllegalArgumentException("Conversation type không hỗ trợ: " + type);
            }

            // Save first message
            messageRepository.save(Message.builder()
                    .conversation(conv).sender(user).content(req.getFirstMessage()).build());

            ConversationResponse response = toResponse(conv, userId);
            notifyParticipants(conv, response);
            log.info("createConversation OK id={}", conv.getConversationId());
            return response;
        } catch (Exception e) {
            log.error("createConversation FAILED userId={} req={}: {}", userId, req, e.getMessage(), e);
            throw e;
        }
    }

    private Conversation createBuyerSeller(User buyer, CreateConversationRequest req) {
        if (req.getSellerId() == null && (req.getSellerEmail() == null || req.getSellerEmail().isBlank())) {
            throw new IllegalArgumentException("BUYER_SELLER yêu cầu sellerId hoặc sellerEmail");
        }
        if (req.getSellerId() != null && buyer.getId() == req.getSellerId().intValue()) {
            throw new IllegalArgumentException("Không thể tự nhắn với chính mình");
        }
        User seller;
        if (req.getSellerEmail() != null && !req.getSellerEmail().isBlank()) {
            String email = req.getSellerEmail().trim().toLowerCase();
            seller = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Không tìm thấy người bán với email: " + email));
            if (seller.getId() == buyer.getId()) {
                throw new IllegalArgumentException("Không thể tự nhắn với chính mình");
            }
        } else {
            seller = userRepository.findById(req.getSellerId().intValue())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Seller không tồn tại: " + req.getSellerId()));
        }

        Product product = null;
        if (req.getProductId() != null) {
            product = productRepository.findById(req.getProductId()).orElse(null);
        }

        // Reuse existing open conversation
        List<Conversation> existing = conversationRepository.findActiveBuyerSeller(
                buyer.getId(), seller.getId(), req.getProductId());
        if (!existing.isEmpty()) {
            return existing.get(0);
        }

        return conversationRepository.save(Conversation.builder()
                .user(buyer)
                .seller(seller)
                .product(product)
                .type(ConversationType.BUYER_SELLER)
                .subject(req.getSubject())
                .build());
    }

    private Conversation createStaffSupport(User user, ConversationType type) {
        // Reuse existing open support conversation
        List<Conversation> existing = conversationRepository.findActiveSupportByUser(user.getId());
        for (Conversation c : existing) {
            if (c.getType() == type) {
                return c;
            }
        }
        return conversationRepository.save(Conversation.builder()
                .user(user)
                .type(type)
                .subject(parseSubject(type, user))
                .build());
    }

    private String parseSubject(ConversationType type, User user) {
        return switch (type) {
            case BUYER_STAFF -> "Yêu cầu hỗ trợ từ " + user.getUsername();
            case SELLER_STAFF -> "Yêu cầu hỗ trợ người bán từ " + user.getUsername();
            default -> "Hỗ trợ";
        };
    }

    private ConversationType parseType(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Conversation type không được để trống");
        }
        try {
            return ConversationType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Conversation type không hợp lệ: " + raw);
        }
    }

    private void validateCreatorRole(User user, ConversationType type) {
        if (type == ConversationType.BUYER_SELLER) {
            throw new AccessDeniedException(
                    "Direct buyer-seller chat is disabled. Please contact staff for support.");
        }
        String role = user.getRole().getRoleName();
        boolean isBuyer = "User".equalsIgnoreCase(role);
        boolean isSeller = "Seller".equalsIgnoreCase(role);
        switch (type) {
            case BUYER_SELLER -> {
                if (!isBuyer && !isSeller) {
                    throw new AccessDeniedException("Chỉ User hoặc Seller mới có thể tạo cuộc hội thoại buyer ↔ seller");
                }
            }
            case BUYER_STAFF -> {
                if (!isBuyer) {
                    throw new AccessDeniedException("Chỉ User mới có thể yêu cầu hỗ trợ với tư cách buyer");
                }
            }
            case SELLER_STAFF -> {
                if (!isSeller) {
                    throw new AccessDeniedException("Chỉ Seller mới có thể yêu cầu hỗ trợ với tư cách seller");
                }
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationResponse> getMyConversations(Long userId) {
        User user = userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại: " + userId));
        String role = user.getRole().getRoleName();
        List<Conversation> all;

        if ("Admin".equalsIgnoreCase(role)) {
            all = conversationRepository.findAllByOrderByUpdatedAtDesc();
        } else if ("Staff".equalsIgnoreCase(role)) {
            // Staff: thấy tất cả conversation có staff (BUYER_STAFF / SELLER_STAFF), KHÔNG thấy BUYER_SELLER
            all = conversationRepository.findAllByOrderByUpdatedAtDesc().stream()
                    .filter(c -> c.getType() != ConversationType.BUYER_SELLER)
                    .toList();
        } else {
            // User/Seller: BUYER_SELLER mình là 1 phía + support mình tạo
            all = conversationRepository.findAllByOrderByUpdatedAtDesc().stream()
                    .filter(c -> isParticipant(c, user))
                    .toList();
        }
        return all.stream().map(c -> toResponse(c, userId)).toList();
    }

    private boolean isParticipant(Conversation c, User user) {
        if (c.getType() == ConversationType.BUYER_SELLER) {
            boolean isBuyer = c.getUser().getId() == user.getId();
            boolean isSeller = c.getSeller() != null && c.getSeller().getId() == user.getId();
            return isBuyer || isSeller;
        }
        // Support: chỉ creator (user) + assigned staff
        if (c.getUser().getId() == user.getId()) return true;
        return c.getAssignedStaff() != null && c.getAssignedStaff().getId() == user.getId();
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
    @Transactional(readOnly = true)
    public List<ConversationResponse> getAllConversations() {
        // Admin: tất cả
        return conversationRepository.findAllByOrderByUpdatedAtDesc()
                .stream().map(c -> toResponse(c, 0L)).toList();
    }

    @Override
    public ConversationResponse assignConversationToStaff(Long conversationId, Long staffId) {
        Conversation conv = findConvOrThrow(conversationId);
        User staff = userRepository.findById(Math.toIntExact(staffId))
                .orElseThrow(() -> new ResourceNotFoundException("Staff không tồn tại: " + staffId));

        boolean wasUnassigned = conv.getAssignedStaff() == null;
        conv.setAssignedStaff(staff);
        if (conv.getStatus() == ConversationStatus.OPEN) {
            conv.setStatus(ConversationStatus.IN_PROGRESS);
        }
        conv = conversationRepository.save(conv);

        ConversationResponse response = toResponse(conv, staffId);
        if (wasUnassigned) {
            messagingTemplate.convertAndSendToUser(
                    conv.getUser().getId() + "",
                    "/queue/conversation-assigned",
                    response);
        }
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
        User requester = userRepository.findById(Math.toIntExact(requesterId))
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        // Staff/Admin tự động "nhận" conversation khi mở lần đầu (chỉ khi support, chưa có ai nhận)
        String role = requester.getRole().getRoleName();
        if (("Staff".equalsIgnoreCase(role) || "Admin".equalsIgnoreCase(role))
                && conv.getType() != ConversationType.BUYER_SELLER
                && conv.getAssignedStaff() == null) {
            conv.setAssignedStaff(requester);
            if (conv.getStatus() == ConversationStatus.OPEN) {
                conv.setStatus(ConversationStatus.IN_PROGRESS);
            }
            conv = conversationRepository.save(conv);
            log.info("{} {} auto-assigned conversation {}", role, requesterId, conversationId);
        }

        validateViewAccess(conv, requester);
        messageRepository.markAllAsRead(conversationId, Math.toIntExact(requesterId));

        List<MessageResponse> messages = messageRepository
                .findByConversation_ConversationIdOrderBySentAtAsc(conversationId)
                .stream().map(this::toMsgResponse).toList();

        return ConversationDetailResponse.builder()
                .info(toResponse(conv, requesterId))
                .messages(messages)
                .build();
    }

    /**
     * Phân quyền xem:
     * <ul>
     *   <li>BUYER_SELLER: buyer, seller hoặc Admin (giám sát). Staff KHÔNG được xem.</li>
     *   <li>BUYER_STAFF / SELLER_STAFF: creator, assigned staff, Admin.</li>
     * </ul>
     */
    private void validateViewAccess(Conversation conv, User requester) {
        String role = requester.getRole().getRoleName();
        if ("Admin".equalsIgnoreCase(role)) return;

        if (conv.getType() == ConversationType.BUYER_SELLER) {
            if ("Staff".equalsIgnoreCase(role)) {
                throw new AccessDeniedException("Staff không được xem cuộc hội thoại giữa buyer và seller");
            }
            boolean isBuyer = conv.getUser().getId() == requester.getId();
            boolean isSeller = conv.getSeller() != null && conv.getSeller().getId() == requester.getId();
            if (!isBuyer && !isSeller) {
                throw new AccessDeniedException("Bạn không có quyền xem conversation này");
            }
        } else {
            boolean isCreator = conv.getUser().getId() == requester.getId();
            boolean isAssignedStaff = conv.getAssignedStaff() != null
                    && conv.getAssignedStaff().getId() == requester.getId();
            boolean isStaffViewingSupport = "Staff".equalsIgnoreCase(role)
                    && conv.getType() != ConversationType.BUYER_SELLER;
            if (!isCreator && !isAssignedStaff && !isStaffViewingSupport) {
                throw new AccessDeniedException("Bạn không có quyền xem conversation này");
            }
        }
    }

    private void notifyParticipants(Conversation conv, ConversationResponse response) {
        if (conv.getType() == ConversationType.BUYER_SELLER) {
            // Gửi cho buyer + seller qua user-queue
            messagingTemplate.convertAndSendToUser(conv.getUser().getId() + "", "/queue/conversation-new", response);
            if (conv.getSeller() != null) {
                messagingTemplate.convertAndSendToUser(conv.getSeller().getId() + "", "/queue/conversation-new", response);
            }
            // Admin cũng nhận topic riêng để giám sát
            messagingTemplate.convertAndSend("/topic/admin/conversations", response);
        } else {
            // Support: gửi topic staff
            messagingTemplate.convertAndSend("/topic/staff/new-conversation", response);
        }
    }

    private Conversation findConvOrThrow(Long id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation không tồn tại: " + id));
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
                .sellerId(c.getSeller() != null ? c.getSeller().getUserId() : null)
                .sellerName(c.getSeller() != null ? c.getSeller().getUsername() : null)
                .productId(c.getProduct() != null ? c.getProduct().getProductId() : null)
                .type(c.getType() != null ? c.getType().name() : null)
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
