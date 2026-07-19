package com.auction.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiValuationResponse {
    /** Full assistant reply for the chat UI. */
    private String reply;
    /** Short summary line (also used as legacy `summary`). */
    private String summary;
    private Long lowEstimate;
    private Long highEstimate;
    private String currency;
}
