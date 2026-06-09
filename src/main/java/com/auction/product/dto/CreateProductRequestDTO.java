package com.swp391.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
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

    private List<CreateProductImageDTO> images;

    private List<CreateProductAttributeValueDTO> attributes;
}
