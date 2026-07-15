package com.auction.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class AttributeOptionDTO {
    private Long optionId;

    @NotNull(message = "Attribute ID is required")
    private Long attributeId;

    @NotBlank(message = "Option value is required")
    @Size(max = 100, message = "Option value must not exceed 100 characters")
    private String optionValue;
}

