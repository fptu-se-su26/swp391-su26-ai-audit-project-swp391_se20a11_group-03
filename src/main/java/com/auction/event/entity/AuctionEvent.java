package com.auction.event.entity;

import com.auction.account.entity.User;
import com.auction.event.enums.EventCategory;
import com.auction.event.enums.BiddingMode;
import com.auction.event.enums.EventStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "AuctionEvents")
@Getter
@Setter
public class AuctionEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EventId")
    private Long eventId;

    @Column(name = "Name", nullable = false, length = 255)
    private String name;

    @Column(name = "Slug", nullable = false, unique = true, length = 255)
    private String slug;

    @Column(name = "Description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "BannerUrl", length = 500)
    private String bannerUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "EventCategory", nullable = false, length = 20)
    private EventCategory eventCategory;

    @Enumerated(EnumType.STRING)
    @Column(name = "BiddingMode", nullable = false, length = 20)
    private BiddingMode biddingMode;

    @Column(name = "IsCharity", nullable = false)
    private boolean isCharity = false;

    @Column(name = "CharityPercent")
    private Integer charityPercent;

    @Column(name = "RegistrationOpenAt")
    private LocalDateTime registrationOpenAt;

    @Column(name = "RegistrationDeadline")
    private LocalDateTime registrationDeadline;

    @Column(name = "StartTime", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "EndTime", nullable = false)
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false, length = 20)
    private EventStatus status = EventStatus.DRAFT;

    @Column(name = "RulesText", columnDefinition = "NVARCHAR(MAX)")
    private String rulesText;

    @Column(name = "RewardDescription", columnDefinition = "NVARCHAR(MAX)")
    private String rewardDescription;

    @Column(name = "DutchConfigJson", columnDefinition = "NVARCHAR(MAX)")
    private String dutchConfigJson;

    @Column(name = "SealedConfigJson", columnDefinition = "NVARCHAR(MAX)")
    private String sealedConfigJson;

    @Column(name = "PennyConfigJson", columnDefinition = "NVARCHAR(MAX)")
    private String pennyConfigJson;

    @Column(name = "AllowSellerSubmission", nullable = false)
    private boolean allowSellerSubmission = true;

    @Column(name = "CreatedBy")
    private Long createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CreatedBy", insertable = false, updatable = false)
    private User createdByUser;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @Version
    @Column(name = "Version", nullable = false)
    private Long version;
}
