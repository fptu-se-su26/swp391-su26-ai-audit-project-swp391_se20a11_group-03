package com.auction.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One row of platform purchase/sales history: a settled (paid) auction.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesHistoryDTO {
    private Long auctionId;
    private Long productId;
    private String productName;
    private String sellerName;
    private String buyerName;
    private long finalPrice;     // winning bid
    private long commission;     // platform commission (20%)
    private long sellerPayout;   // finalPrice - commission
    private String status;       // auction status
    private String paymentStatus;
    private String paidAt;       // settledAt or endTime (ISO)
}
