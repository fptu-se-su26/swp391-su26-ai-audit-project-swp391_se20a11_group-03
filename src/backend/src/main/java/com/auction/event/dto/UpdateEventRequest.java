package com.auction.event.dto;

import com.auction.event.enums.EventCategory;
import com.auction.event.enums.BiddingMode;
import com.auction.event.enums.EventMoneyMode;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UpdateEventRequest {
    @Size(min = 1, max = 255)
    private String name;

    @Size(min = 1, max = 255)
    @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*", message = "must use lowercase letters, numbers and hyphens")
    private String slug;
    private String description;
    @Size(max = 500)
    private String bannerUrl;
    private EventCategory eventCategory;
    private BiddingMode biddingMode;
    private EventMoneyMode moneyMode;
    @Positive
    private Long depositAmount;
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
