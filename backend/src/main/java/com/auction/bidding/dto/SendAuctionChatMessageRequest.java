package com.auction.bidding.dto;

import lombok.Data;

@Data
public class SendAuctionChatMessageRequest {
    private Long auctionId;
    private String content;
}
