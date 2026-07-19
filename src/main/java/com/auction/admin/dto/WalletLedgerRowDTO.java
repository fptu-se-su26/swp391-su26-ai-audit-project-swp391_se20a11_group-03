package com.auction.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WalletLedgerRowDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long amount;
    private String status;
    private String description;
    private String referenceCode;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private String staffNote;
    private String createdAt;
    private String updatedAt;
}
