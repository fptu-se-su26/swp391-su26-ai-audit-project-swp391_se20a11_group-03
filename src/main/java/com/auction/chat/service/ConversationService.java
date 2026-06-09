package org.example.backend.service;

import org.example.backend.dto.request.CreateConversationRequest;
import org.example.backend.dto.response.ConversationDetailResponse;
import org.example.backend.dto.response.ConversationResponse;

import java.util.List;

public interface ConversationService {
    ConversationResponse createConversation(Long userId, CreateConversationRequest request);
    List<ConversationResponse> getMyConversations(Long userId);
    List<ConversationResponse> getConversationsAssignedToStaff(Long staffId);
    List<ConversationResponse> getUnassignedConversations();
    ConversationResponse assignConversationToStaff(Long conversationId, Long staffId);
    ConversationResponse closeConversation(Long conversationId, Long actorId);
    ConversationDetailResponse getConversationDetail(Long conversationId, Long requesterId);
}

