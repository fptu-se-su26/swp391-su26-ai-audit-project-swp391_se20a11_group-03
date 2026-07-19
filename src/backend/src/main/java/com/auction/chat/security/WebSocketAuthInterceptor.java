package com.auction.chat.security;

import com.auction.account.security.JwtService;
import com.auction.account.security.UserDetailsImpl;
import com.auction.account.security.UserDetailsServiceImpl;
import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.chat.entity.Conversation;
import com.auction.chat.enums.ConversationType;
import com.auction.chat.repository.ConversationRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.security.access.AccessDeniedException;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String username = jwtService.extractUsername(token);
                    if (username != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        if (jwtService.isTokenValid(token, userDetails)) {
                            // Use userId as principal name to match convertAndSendToUser calls
                            final String userId = String.valueOf(
                                    ((UserDetailsImpl) userDetails).getId());
                            accessor.setUser((Principal) () -> userId);
                        }
                    }
                } catch (Exception ignored) {
                    // Invalid token — connection proceeds unauthenticated
                }
            }
        }
        if (accessor != null && StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            validateSubscription(accessor);
        }
        return message;
    }

    private void validateSubscription(StompHeaderAccessor accessor) {
        String destination = accessor.getDestination();
        if (destination == null || !destination.startsWith("/topic/")) return;
        Principal principal = accessor.getUser();
        if (principal == null) throw new AccessDeniedException("Authentication required for chat subscription");
        User user;
        try {
            user = userRepository.findById(Math.toIntExact(Long.parseLong(principal.getName())))
                    .orElseThrow(() -> new AccessDeniedException("User not found"));
        } catch (NumberFormatException ex) {
            throw new AccessDeniedException("Invalid chat principal");
        }
        String role = user.getRole() == null ? "" : user.getRole().getRoleName();
        if ("/topic/staff/new-conversation".equals(destination)) {
            if (!"Staff".equalsIgnoreCase(role) && !"Admin".equalsIgnoreCase(role))
                throw new AccessDeniedException("Staff role required");
            return;
        }
        if (destination.startsWith("/topic/conversation/")) {
            long conversationId;
            try { conversationId = Long.parseLong(destination.substring("/topic/conversation/".length())); }
            catch (NumberFormatException ex) { throw new AccessDeniedException("Invalid conversation topic"); }
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new AccessDeniedException("Conversation not found"));
            boolean staffAccess = ("Staff".equalsIgnoreCase(role) || "Admin".equalsIgnoreCase(role))
                    && conversation.getType() != ConversationType.BUYER_SELLER;
            boolean participant = conversation.getUser().getId() == user.getId()
                    || (conversation.getSeller() != null && conversation.getSeller().getId() == user.getId())
                    || (conversation.getAssignedStaff() != null && conversation.getAssignedStaff().getId() == user.getId());
            if (!staffAccess && !participant) throw new AccessDeniedException("Not a conversation participant");
        }
    }
}

