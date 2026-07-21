package com.auction.event.entity;

import com.auction.account.entity.User;
import com.auction.event.enums.EventProductSourceType;
import com.auction.event.enums.EventProductApprovalStatus;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "EventProducts")
@Getter
@Setter
public class EventProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "EventProductId")
    private Long eventProductId;

    @Column(name = "EventId", nullable = false)
    private Long eventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EventId", insertable = false, updatable = false)
    private AuctionEvent event;

    @Column(name = "ProductId")
    private Long productId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ProductId", insertable = false, updatable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "SourceType", nullable = false, length = 20)
    private EventProductSourceType sourceType;

    @Column(name = "SubmittedBySellerId", nullable = false)
    private Long submittedBySellerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SubmittedBySellerId", insertable = false, updatable = false)
    private User submittedBySeller;

    @Enumerated(EnumType.STRING)
    @Column(name = "ApprovalStatus", nullable = false, length = 20)
    private EventProductApprovalStatus approvalStatus = EventProductApprovalStatus.PENDING;

    @Column(name = "RejectReason", length = 500)
    private String rejectReason;

    @Column(name = "StartingPrice", nullable = false)
    private Long startingPrice;

    @Column(name = "CurrentPrice", nullable = false)
    private Long currentPrice;

    @Column(name = "PriceStep")
    private Long priceStep;

    @Column(name = "ReservePrice")
    private Long reservePrice;

    @Column(name = "SessionStart")
    private LocalDateTime sessionStart;

    @Column(name = "SessionEnd")
    private LocalDateTime sessionEnd;

    @Enumerated(EnumType.STRING)
    @Column(name = "SessionStatus", nullable = false, length = 20)
    private EventProductSessionStatus sessionStatus = EventProductSessionStatus.SCHEDULED;

    @Column(name = "WinnerId")
    private Long winnerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WinnerId", insertable = false, updatable = false)
    private User winner;

    @Column(name = "FinalPrice")
    private Long finalPrice;

    @Version
    @Column(name = "Version", nullable = false)
    private Long version;
}
