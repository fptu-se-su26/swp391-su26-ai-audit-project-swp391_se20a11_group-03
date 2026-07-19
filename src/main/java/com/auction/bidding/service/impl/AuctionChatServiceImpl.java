package com.auction.bidding.service.impl;

import com.auction.account.entity.User;
import com.auction.account.dao.UserRepository;
import com.auction.bidding.dto.AuctionChatMessageResponse;
import com.auction.bidding.dto.AuctionChatStatusResponse;
import com.auction.bidding.entity.AuctionChatMessage;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.repository.AuctionChatMessageRepository;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.service.AuctionChatService;
import com.auction.bidding.service.AuctionChatService;
import com.auction.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AuctionChatServiceImpl implements AuctionChatService {

    private final AuctionChatMessageRepository chatMessageRepository;
    private final AuctionSessionRepository auctionSessionRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    @Transactional(readOnly = true)
    public AuctionChatStatusResponse getChatStatus(Long auctionId) {
        AuctionSession auction = requireAuction(auctionId);
        return buildStatus(auction);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuctionChatMessageResponse> getMessages(Long auctionId) {
        requireAuction(auctionId);
        return chatMessageRepository.findByAuctionIdOrderBySentAtAsc(auctionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AuctionChatMessageResponse sendMessage(Long auctionId, Long senderId, String content) {
        AuctionSession auction = requireAuction(auctionId);
        AuctionChatStatusResponse status = buildStatus(auction);
        if (!status.isOpen()) {
            throw new IllegalStateException("Phòng chat đã đóng");
        }

        String trimmed = content == null ? "" : content.trim();
        if (trimmed.isEmpty()) {
            throw new IllegalArgumentException("Nội dung tin nhắn không được để trống");
        }
        if (trimmed.length() > 1000) {
            throw new IllegalArgumentException("Tin nhắn tối đa 1000 ký tự");
        }

        User sender = userRepository.findById(Math.toIntExact(senderId))
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));

        AuctionChatMessage saved = chatMessageRepository.save(
                AuctionChatMessage.builder()
                        .auctionId(auctionId)
                        .sender(sender)
                        .content(trimmed)
                        .build());

        AuctionChatMessageResponse response = toResponse(saved);
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/chat", response);
        return response;
    }

    private AuctionSession requireAuction(Long auctionId) {
        return auctionSessionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));
    }

    private AuctionChatStatusResponse buildStatus(AuctionSession auction) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = auction.getStartTime();
        LocalDateTime end = auction.getEndTime();

        if (start != null && now.isBefore(start)) {
            return AuctionChatStatusResponse.builder()
                    .open(false)
                    .phase("NOT_STARTED")
                    .closesAt(null)
                    .build();
        }

        LocalDateTime closesAt = end != null ? end.plusMinutes(CHAT_GRACE_MINUTES) : null;
        if (closesAt != null && now.isAfter(closesAt)) {
            return AuctionChatStatusResponse.builder()
                    .open(false)
                    .phase("CLOSED")
                    .closesAt(closesAt)
                    .build();
        }

        boolean inGrace = end != null && now.isAfter(end);
        return AuctionChatStatusResponse.builder()
                .open(true)
                .phase(inGrace ? "GRACE" : "OPEN")
                .closesAt(closesAt)
                .build();
    }

    private AuctionChatMessageResponse toResponse(AuctionChatMessage message) {
        User sender = message.getSender();
        return AuctionChatMessageResponse.builder()
                .messageId(message.getMessageId())
                .auctionId(message.getAuctionId())
                .senderId(sender.getUserId())
                .senderName(sender.getUsername())
                .senderRole(sender.getRole() != null ? sender.getRole().getRoleName() : null)
                .content(message.getContent())
                .sentAt(message.getSentAt())
                .build();
    }
}
