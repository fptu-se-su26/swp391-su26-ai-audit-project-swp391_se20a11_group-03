package com.swp391.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * @author Pham Manh Thang
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponseDTO {
    private Long productId;
    private Long sellerId;
    private String sellerName;
    private Integer categoryId;
    private String categoryName;
    private String productName;
    private String description;
    private String imagesUrl;
    private String condition;
    private String brand;
    private String origin;
    private String weightSize;
    private Long startingPrice;
    private Long stepPrice;
    private String status;
    private LocalDateTime createdAt;
    private Integer taxPercent;
}
