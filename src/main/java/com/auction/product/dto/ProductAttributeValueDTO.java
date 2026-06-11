package com.auction.product.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Pham Manh Thang
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductAttributeValueDTO {
    private Long valueId;
    private Long attributeId;
    private String attributeValue;
}

