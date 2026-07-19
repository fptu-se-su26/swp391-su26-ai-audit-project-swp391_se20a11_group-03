package com.auction.bidding.entity;

import com.auction.product.entity.Product;
import com.auction.account.entity.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Auctions")
@Getter
@Setter
public class Auction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AuctionId")
    private Long auctionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ProductId", nullable = false, unique = true)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "AuctionMode", nullable = false, length = 10)
    private AuctionMode auctionMode = AuctionMode.TIMED;

    @Column(name = "ScheduledDurationSeconds")
    private Long scheduledDurationSeconds;

    @Column(name = "StartTime", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "EndTime", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "CurrentHighestBid", nullable = false)
    private Long currentHighestBid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CurrentWinnerUserId")
    private User currentWinnerUser;

    @Column(name = "Status", nullable = false)
    private String status;

    @Column(name = "PaymentStatus", length = 20)
    private String paymentStatus;

    @Column(name = "PaymentDeadline")
    private LocalDateTime paymentDeadline;

    @Column(name = "SettledAt")
    private LocalDateTime settledAt;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}
