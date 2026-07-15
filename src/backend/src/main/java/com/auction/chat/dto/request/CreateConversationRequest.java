package com.auction.chat.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateConversationRequest {

    @NotBlank(message = "Subject không được để trống")
    @Size(max = 255)
    private String subject;

    @NotBlank(message = "Nội dung tin nhắn đầu tiên không được để trống")
    private String firstMessage;

    /**
     * Loại conversation. Bắt buộc.
     * BUYER_SELLER: yêu cầu {@code sellerId} và có thể kèm {@code productId}.
     * BUYER_STAFF / SELLER_STAFF: staff sẽ được auto-assign khi staff pick up.
     */
    @NotNull(message = "Conversation type không được để trống")
    private String type;

    /**
     * Required khi type = BUYER_SELLER.
     * Có thể truyền {@code sellerId} (UserId) hoặc {@code sellerEmail} (email đăng ký).
     * Nếu cả hai đều có, ưu tiên {@code sellerEmail}.
     */
    private Long sellerId;

    /** Email người bán — thay thế cho sellerId, dễ nhập hơn. */
    private String sellerEmail;

    /** Optional - gắn cuộc hội thoại với một sản phẩm cụ thể */
    private Long productId;
}