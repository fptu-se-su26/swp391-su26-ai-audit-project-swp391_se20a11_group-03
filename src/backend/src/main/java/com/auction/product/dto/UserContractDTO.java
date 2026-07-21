package com.auction.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserContractDTO {
    private Long contractId;
    private String contractType;
    private Long referenceId;
    private String referenceName;
    private String partyRole;
    private LocalDateTime createdAt;
}
