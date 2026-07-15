package com.auction.product.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PurchaseContractPreviewDTO {
    private Long auctionId;
    private Long productId;
    private String productName;
    private Long finalPrice;
    private String sellerName;
    private String sellerEmail;
    private String buyerName;
    private String buyerEmail;
    private String adminName;
    private String adminEmail;
    private boolean signed;
    /** True when the buyer acknowledged the contract in UI but payment has not completed yet. */
    private boolean acknowledged;
    private Long contractId;
    private String fileUrl;
    private String signedAt;
}
