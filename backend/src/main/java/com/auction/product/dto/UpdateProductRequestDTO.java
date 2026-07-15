package com.auction.product.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * DTO for seller to update a product (only PENDING or REJECTED status).
 * Fields are all optional - only provided ones are updated.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequestDTO {
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String productName;

    private String description;

    private Long startingPrice;

    /** Auction mode: "LIVE" or "TIMED" */
    private String auctionMode;

    private LocalDateTime scheduledStartTime;

    private Long scheduledDurationSeconds;
}
