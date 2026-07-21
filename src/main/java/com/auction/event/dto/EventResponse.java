package com.auction.event.dto;

import com.auction.event.entity.AuctionEvent;
import com.auction.event.enums.EventCategory;
import com.auction.event.enums.BiddingMode;
import com.auction.event.enums.EventStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private Long eventId;
    private String name;
    private String slug;
    private String description;
    private String bannerUrl;
    private EventCategory eventCategory;
    private BiddingMode biddingMode;
    private Boolean isCharity;
    private Integer charityPercent;
    private LocalDateTime registrationOpenAt;
    private LocalDateTime registrationDeadline;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private EventStatus status;
    private String rulesText;
    private String rewardDescription;
    private String dutchConfigJson;
    private String sealedConfigJson;
    private String pennyConfigJson;
    private Boolean allowSellerSubmission;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, Long> productCountByStatus;

    public static EventResponse fromEntity(AuctionEvent event) {
        EventResponse response = new EventResponse();
        response.setEventId(event.getEventId());
        response.setName(event.getName());
        response.setSlug(event.getSlug());
        response.setDescription(event.getDescription());
        response.setBannerUrl(event.getBannerUrl());
        response.setEventCategory(event.getEventCategory());
        response.setBiddingMode(event.getBiddingMode());
        response.setIsCharity(event.isCharity());
        response.setCharityPercent(event.getCharityPercent());
        response.setRegistrationOpenAt(event.getRegistrationOpenAt());
        response.setRegistrationDeadline(event.getRegistrationDeadline());
        response.setStartTime(event.getStartTime());
        response.setEndTime(event.getEndTime());
        response.setStatus(event.getStatus());
        response.setRulesText(event.getRulesText());
        response.setRewardDescription(event.getRewardDescription());
        response.setDutchConfigJson(event.getDutchConfigJson());
        response.setSealedConfigJson(event.getSealedConfigJson());
        response.setPennyConfigJson(event.getPennyConfigJson());
        response.setAllowSellerSubmission(event.isAllowSellerSubmission());
        response.setCreatedBy(event.getCreatedBy());
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());
        return response;
    }
}
