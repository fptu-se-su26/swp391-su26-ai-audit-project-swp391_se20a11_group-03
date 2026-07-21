package com.auction.event.dto;

import com.auction.event.entity.EventProduct;
import com.auction.event.enums.EventProductApprovalStatus;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.enums.EventProductSourceType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventProductResponse {
    private Long eventProductId;
    private Long eventId;
    private Long productId;
    private EventProductSourceType sourceType;
    private Long submittedBySellerId;
    private EventProductApprovalStatus approvalStatus;
    private String rejectReason;
    private Long startingPrice;
    private Long currentPrice;
    private Long priceStep;
    private Long reservePrice;
    private LocalDateTime sessionStart;
    private LocalDateTime sessionEnd;
    private EventProductSessionStatus sessionStatus;
    private Long winnerId;
    private Long finalPrice;

    public static EventProductResponse fromEntity(EventProduct entity) {
        EventProductResponse response = new EventProductResponse();
        response.setEventProductId(entity.getEventProductId());
        response.setEventId(entity.getEventId());
        response.setProductId(entity.getProductId());
        response.setSourceType(entity.getSourceType());
        response.setSubmittedBySellerId(entity.getSubmittedBySellerId());
        response.setApprovalStatus(entity.getApprovalStatus());
        response.setRejectReason(entity.getRejectReason());
        response.setStartingPrice(entity.getStartingPrice());
        response.setCurrentPrice(entity.getCurrentPrice());
        response.setPriceStep(entity.getPriceStep());
        response.setReservePrice(entity.getReservePrice());
        response.setSessionStart(entity.getSessionStart());
        response.setSessionEnd(entity.getSessionEnd());
        response.setSessionStatus(entity.getSessionStatus());
        response.setWinnerId(entity.getWinnerId());
        response.setFinalPrice(entity.getFinalPrice());
        return response;
    }
}
