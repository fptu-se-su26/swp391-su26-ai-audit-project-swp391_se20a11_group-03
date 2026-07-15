package com.auction.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SendMessageRequest {

    @NotNull(message = "ConversationId không được null")
    private Long conversationId;

    @NotBlank(message = "Nội dung không được để trống")
    private String content;
}

