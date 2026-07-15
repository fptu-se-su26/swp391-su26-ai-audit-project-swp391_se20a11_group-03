package com.auction.chat.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data @Builder
public class ConversationResponse {
    private Long conversationId;
    /** Người tạo / người gửi đầu tiên (buyer hoặc user yêu cầu). */
    private Long userId;
    private String userName;
    /** BUYER_SELLER: null. BUYER_STAFF/SELLER_STAFF: staff được gán. */
    private Long assignedStaffId;
    private String assignedStaffName;
    /** BUYER_SELLER: seller. Các loại khác: null. */
    private Long sellerId;
    private String sellerName;
    /** ID sản phẩm liên quan (nếu có). */
    private Long productId;
    /** BUYER_SELLER / BUYER_STAFF / SELLER_STAFF */
    private String type;
    private String subject;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String lastMessage;
    private int unreadCount;
}