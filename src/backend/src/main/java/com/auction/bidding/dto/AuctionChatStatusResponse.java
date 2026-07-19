package com.auction.bidding.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuctionChatStatusResponse {
    private boolean open;
    private String phase;
    private LocalDateTime closesAt;
}
