package com.auction.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionSessionHistoryDTO {
    private Long auctionId;
    private Long productId;
    private String productName;
    private String sellerName;
    private String buyerName;
    private long finalPrice;
    private String auctionStatus;
    private String paymentStatus;
    /** PAID or UNPAID */
    private String paymentCategory;
    private String endTime;
    private String paidAt;
    private String paymentDeadline;
}
