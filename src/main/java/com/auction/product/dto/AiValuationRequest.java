package com.auction.product.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class AiValuationRequest {
    private String productName;
    private String description;
    private Long startingPrice;
    /** Optional free-form chat question from the seller. */
    private String message;
    /** Optional inline images as base64 (with or without data: URL prefix). Max handled server-side. */
    private List<AiValuationImage> images = new ArrayList<>();

    @Data
    public static class AiValuationImage {
        private String mimeType;
        private String base64;
    }
}
