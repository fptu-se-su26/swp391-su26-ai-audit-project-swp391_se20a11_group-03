package org.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PricingChatRequest {

    /** Null khi bắt đầu hội thoại mới; truyền lại id để tiếp tục hội thoại cũ. */
    private Long conversationId;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 2000, message = "Tin nhắn quá dài (tối đa 2000 ký tự)")
    private String message;
}
