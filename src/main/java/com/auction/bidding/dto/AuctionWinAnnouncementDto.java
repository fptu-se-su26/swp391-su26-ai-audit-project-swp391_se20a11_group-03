package com.auction.bidding.dto;

import java.time.LocalDateTime;

public class AuctionWinAnnouncementDto {
    private String type = "AUCTION_WON";
    private Long auctionId;
    private Long productId;
    private Long winnerUserId;
    private String winnerUsername;
    private String productName;
    private Long finalPriceVnd;
    private LocalDateTime settledAt;

    public static AuctionWinAnnouncementDto of(
            Long auctionId,
            Long productId,
            Long winnerUserId,
            String winnerUsername,
            String productName,
            Long finalPriceVnd,
            LocalDateTime settledAt) {
        AuctionWinAnnouncementDto dto = new AuctionWinAnnouncementDto();
        dto.auctionId = auctionId;
        dto.productId = productId;
        dto.winnerUserId = winnerUserId;
        dto.winnerUsername = winnerUsername;
        dto.productName = productName;
        dto.finalPriceVnd = finalPriceVnd;
        dto.settledAt = settledAt;
        return dto;
    }

    public String getType() { return type; }
    public Long getAuctionId() { return auctionId; }
    public Long getProductId() { return productId; }
    public Long getWinnerUserId() { return winnerUserId; }
    public String getWinnerUsername() { return winnerUsername; }
    public String getProductName() { return productName; }
    public Long getFinalPriceVnd() { return finalPriceVnd; }
    public LocalDateTime getSettledAt() { return settledAt; }
}
