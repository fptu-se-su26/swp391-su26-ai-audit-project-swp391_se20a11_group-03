package com.auction.bidding.dto;

import java.time.LocalDateTime;

public class AuctionWinAnnouncementDto {
    private String type;
    private Long auctionId;
    private Long productId;
    private Long winnerUserId;
    private String winnerUsername;
    private String productName;
    private Long finalPriceVnd;
    private LocalDateTime settledAt;
    private LocalDateTime paymentDeadline;

    public static AuctionWinAnnouncementDto won(
            Long auctionId,
            Long productId,
            Long winnerUserId,
            String winnerUsername,
            String productName,
            Long finalPriceVnd,
            LocalDateTime settledAt,
            LocalDateTime paymentDeadline) {
        AuctionWinAnnouncementDto dto = new AuctionWinAnnouncementDto();
        dto.type = "AUCTION_WON";
        dto.auctionId = auctionId;
        dto.productId = productId;
        dto.winnerUserId = winnerUserId;
        dto.winnerUsername = winnerUsername;
        dto.productName = productName;
        dto.finalPriceVnd = finalPriceVnd;
        dto.settledAt = settledAt;
        dto.paymentDeadline = paymentDeadline;
        return dto;
    }

    public static AuctionWinAnnouncementDto noWinner(
            Long auctionId,
            Long productId,
            String productName,
            Long finalPriceVnd,
            LocalDateTime settledAt) {
        AuctionWinAnnouncementDto dto = new AuctionWinAnnouncementDto();
        dto.type = "AUCTION_ENDED_NO_WINNER";
        dto.auctionId = auctionId;
        dto.productId = productId;
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
    public LocalDateTime getPaymentDeadline() { return paymentDeadline; }
}
