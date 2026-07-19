package com.auction.order.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
@Data
public class ShippingAddressRequest {
    @NotBlank @Size(max=150) private String receiverName;
    @NotBlank @Size(max=30) private String receiverPhone;
    @NotBlank @Size(max=255) private String addressLine;
    @NotBlank @Size(max=120) private String ward;
    @NotBlank @Size(max=120) private String district;
    @NotBlank @Size(max=120) private String province;
    @Size(max=500) private String note;
}
