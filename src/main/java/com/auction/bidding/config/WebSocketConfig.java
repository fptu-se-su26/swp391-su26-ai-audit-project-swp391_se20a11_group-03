package com.auction.bidding.config;

/**
 * TODO: Đợi Đức làm xong / hoặc tích hợp lại WebSocket khi dự án đã có Spring dependency.
 *
 * Dự án hiện tại đang là Java Web thuần (Servlet/JSP) và chưa khai báo Spring WebSocket
 * trong pom.xml root, nên giữ class này ở trạng thái an toàn để tránh lỗi biên dịch.
 */
public final class WebSocketConfig {
    public static final String BID_TOPIC = "/topic/bids";
    public static final String AUCTION_STATUS_TOPIC = "/topic/auctions";
    public static final String BID_ENDPOINT = "/ws-bidding";

    private WebSocketConfig() {
        // no-op
    }
}

