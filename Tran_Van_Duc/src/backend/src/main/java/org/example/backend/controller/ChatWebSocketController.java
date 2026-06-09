package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.dto.request.SendMessageRequest;
import org.example.backend.security.UserDetailsImpl;
import org.example.backend.service.MessageService;
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

    private Long extractUserId(Principal principal) {
        if (principal instanceof Authentication auth
                && auth.getPrincipal() instanceof UserDetailsImpl ud) {
            return ud.getId();
        }
        // WebSocket interceptor sets principal name = userId
        return Long.parseLong(principal.getName());
    }
}
