package org.example.backend.service;

import org.example.backend.dto.request.SendMessageRequest;
import org.example.backend.dto.response.MessageResponse;

import java.util.List;

public interface MessageService {
    MessageResponse sendMessage(Long senderId, SendMessageRequest request);
    List<MessageResponse> getMessages(Long conversationId, Long requesterId);
    void markAsRead(Long conversationId, Long userId);
}
