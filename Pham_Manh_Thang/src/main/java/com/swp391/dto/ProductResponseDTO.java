package com.swp391.dto;

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
public class ProductResponseDTO {
    private Long productId;
    private Long sellerId;
    private Integer categoryId;
    private String productName;
    private String description;
    private Long startingPrice;
    private Long stepPrice;
    private Integer taxPercent;
    private String status;
    private LocalDateTime submittedAt;
    private LocalDateTime createdAt;
    private String rejectionReason;
    private List<ProductImageDTO> images;
    private List<ProductAttributeValueDTO> attributes;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class ProductImageDTO {
    private Long imageId;
    private String imageUrl;
    private Boolean isPrimary;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
class ProductAttributeValueDTO {
    private Long valueId;
    private Long attributeId;
    private String attributeValue;
}
