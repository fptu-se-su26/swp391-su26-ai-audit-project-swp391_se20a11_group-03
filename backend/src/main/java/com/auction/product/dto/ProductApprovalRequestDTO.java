package com.auction.product.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Admin/staff approval payload. Schedule fields are required when approving.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductApprovalRequestDTO {
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;

    private String auctionMode;

    private LocalDateTime scheduledStartTime;

    /** Required when auctionMode is TIMED (21600-43200 seconds). */
    private Long scheduledDurationSeconds;
}
