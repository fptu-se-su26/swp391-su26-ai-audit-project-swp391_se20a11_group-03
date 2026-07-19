package com.auction.order.dto;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder
public class OrderResponse {
    private Long orderId, auctionId, productId, buyerId, sellerId, shipperId;
    private String productName, buyerName, sellerName, shipperName;
    private Long finalPrice, shippingFee;
    private String receiverName, receiverPhone, addressLine, ward, district, province, note, status;
    private LocalDateTime assignedAt, deliveredAt, payoutReleasedAt, createdAt, updatedAt;
    private List<HistoryItem> history;
    @Data @Builder public static class HistoryItem { private String fromStatus, toStatus, changedBy, note; private LocalDateTime createdAt; }
}
