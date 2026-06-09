package org.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateConversationRequest {

    @NotBlank(message = "Subject không được để trống")
    @Size(max = 255)
    private String subject;

    @NotBlank(message = "Nội dung tin nhắn đầu tiên không được để trống")
    private String firstMessage;
}

