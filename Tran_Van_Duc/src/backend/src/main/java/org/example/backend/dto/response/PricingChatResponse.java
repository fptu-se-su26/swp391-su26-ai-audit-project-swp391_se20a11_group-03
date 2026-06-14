package org.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PricingChatResponse {

    private Long conversationId;
    private String reply;
    /** true nếu AI có tham khảo dữ liệu giá thật từ DB. */
    private boolean priceContextUsed;
}
