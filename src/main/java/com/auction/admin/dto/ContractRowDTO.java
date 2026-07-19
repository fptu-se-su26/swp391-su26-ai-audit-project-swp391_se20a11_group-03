package com.auction.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One electronic contract row for the admin contracts view.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractRowDTO {
    private Long contractId;
    private String contractType;   // SELLER_AGREEMENT | LISTING
    private String typeLabel;      // human-readable label
    private Long referenceId;      // userId (seller agreement) or productId (listing)
    private String referenceName;  // seller name/email or product name
    private String identityNumber; // CCCD/CMND when resolvable
    private String fileUrl;
    private String createdAt;      // ISO
}
