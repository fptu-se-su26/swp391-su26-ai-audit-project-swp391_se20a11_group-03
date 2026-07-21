package com.auction.event.dto;

import com.auction.event.enums.EventCategory;
import com.auction.event.enums.BiddingMode;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateEventRequest {
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
    private String rulesText;
    private String rewardDescription;
    private String dutchConfigJson;
    private String sealedConfigJson;
    private String pennyConfigJson;
    private Boolean allowSellerSubmission;
}
