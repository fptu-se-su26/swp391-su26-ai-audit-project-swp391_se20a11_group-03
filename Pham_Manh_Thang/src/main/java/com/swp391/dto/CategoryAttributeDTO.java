package com.swp391.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
    private String attributeName;

    @NotBlank(message = "Data type is required")
    private String dataType;

    private Boolean isRequired = false;

    private Integer displayOrder = 0;
}
