package com.auction.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * @author Pham Manh Thang
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateProductRequestDTO {
    @NotNull(message = "Category ID is required")
    private Integer categoryId;

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String productName;

    private String description;

    @NotNull(message = "Starting price is required")
    private Long startingPrice;

    private Long stepPrice = 1000000L;

    private Integer taxPercent = 5;

    /** Auction mode: "LIVE" (3 minutes) or "TIMED" (6-12 hours). Optional. */
    @Pattern(regexp = "LIVE|TIMED", message = "auctionMode must be LIVE or TIMED")
    private String auctionMode;

    /** When the seller wants the auction to open. Required when auctionMode is set. */
    private LocalDateTime scheduledStartTime;

    /** Duration in seconds. LIVE: ignored (fixed 180s). TIMED: 21600-43200 (6-12 hours). */
    private Long scheduledDurationSeconds;

    private List<CreateProductImageDTO> images;

    private List<CreateProductAttributeValueDTO> attributes;
}
