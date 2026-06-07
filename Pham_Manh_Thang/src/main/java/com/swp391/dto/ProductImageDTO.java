package com.swp391.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Pham Manh Thang
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductImageDTO {
    private Long imageId;
    private String imageUrl;
    private Boolean isPrimary;
}
