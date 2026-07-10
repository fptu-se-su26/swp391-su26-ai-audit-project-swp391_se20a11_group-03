package com.auction.chat.controller;

import lombok.RequiredArgsConstructor;
import com.auction.bidding.dto.SendAuctionChatMessageRequest;
import com.auction.bidding.service.AuctionChatService;
import com.auction.chat.dto.request.SendMessageRequest;
import com.auction.account.security.UserDetailsImpl;
import com.auction.chat.service.MessageService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final MessageService messageService;
    private final AuctionChatService auctionChatService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        Long senderId = extractUserId(principal);
        messageService.sendMessage(senderId, request);
    }

    @MessageMapping("/chat.markRead")
    public void markRead(@Payload Map<String, Long> payload, Principal principal) {
        Long userId = extractUserId(principal);
        messageService.markAsRead(payload.get("conversationId"), userId);
    }

    @MessageMapping("/auctionChat.sendMessage")
    public void sendAuctionChatMessage(@Payload SendAuctionChatMessageRequest request, Principal principal) {
        if (request == null || request.getAuctionId() == null || principal == null) {
            return;
        }
        Long senderId = extractUserId(principal);
        auctionChatService.sendMessage(request.getAuctionId(), senderId, request.getContent());
    }

    private Long extractUserId(Principal principal) {
        if (principal instanceof Authentication auth
                && auth.getPrincipal() instanceof UserDetailsImpl ud) {
            return ud.getId();
        }
        // WebSocket interceptor sets principal name = userId
        return Long.parseLong(principal.getName());
    }
}

