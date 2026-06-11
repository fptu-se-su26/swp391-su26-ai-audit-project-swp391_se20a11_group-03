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
public class CategoryAttributeDTO {
    private Long attributeId;

    @NotNull(message = "Category ID is required")
    private Integer categoryId;

    @NotBlank(message = "Attribute name is required")
    @Size(max = 100, message = "Attribute name must not exceed 100 characters")
    private String attributeName;

    @NotBlank(message = "Data type is required")
    @Size(max = 50, message = "Data type must not exceed 50 characters")
    private String dataType;

    private Boolean isRequired = false;

    private Integer displayOrder = 0;
}

