package com.auction.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatbotResponse {
    private String reply;
    private boolean aiGenerated;
}
