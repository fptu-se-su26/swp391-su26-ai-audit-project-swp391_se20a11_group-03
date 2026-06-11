package com.auction.chat.service;

import com.auction.chat.dto.request.CreateConversationRequest;
import com.auction.chat.dto.response.ConversationDetailResponse;
import com.auction.chat.dto.response.ConversationResponse;

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

