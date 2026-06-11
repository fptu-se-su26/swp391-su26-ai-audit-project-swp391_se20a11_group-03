package com.auction.chat.service;

import com.auction.chat.dto.request.SendMessageRequest;
import com.auction.chat.dto.response.MessageResponse;

import java.util.List;

public interface MessageService {
    MessageResponse sendMessage(Long senderId, SendMessageRequest request);
    List<MessageResponse> getMessages(Long conversationId, Long requesterId);
    void markAsRead(Long conversationId, Long userId);
}

