package com.auction.event.dto;

import com.auction.product.dto.CreateProductRequestDTO;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class SubmitNewProductRequest extends CreateProductRequestDTO {
    private Long reservePrice;
}
