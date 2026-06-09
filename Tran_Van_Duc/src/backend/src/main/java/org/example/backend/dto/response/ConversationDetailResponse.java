package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class ConversationDetailResponse {
    private ConversationResponse info;
    private List<MessageResponse> messages;
}
