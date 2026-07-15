package com.auction.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuctionOverviewDTO {
    private long activeCount;
    private long upcomingCount;
    private long awaitingPaymentCount;
    private long endedCount;
    private long totalCount;
    private List<AuctionOverviewItemDTO> activeSessions;
    private List<AuctionOverviewItemDTO> upcomingSessions;
    private List<AuctionOverviewItemDTO> awaitingPaymentSessions;
}
