package com.auction.product.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Pham Manh Thang
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductApprovalRequestDTO {
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}

