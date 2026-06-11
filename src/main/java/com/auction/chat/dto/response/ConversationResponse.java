package com.auction.chat.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ConversationResponse {
    private Long conversationId;
    private Long userId;
    private String userName;
    private Long assignedStaffId;
    private String assignedStaffName;
    private String subject;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String lastMessage;
    private int unreadCount;
}

