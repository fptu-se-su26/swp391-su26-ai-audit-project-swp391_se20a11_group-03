package com.auction.event.entity;

import com.auction.account.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "PennyBids")
@Getter
@Setter
public class PennyBid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PennyBidId")
    private Long pennyBidId;

    @Column(name = "EventProductId", nullable = false)
    private Long eventProductId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EventProductId", insertable = false, updatable = false)
    private EventProduct eventProduct;

    @Column(name = "UserId", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", insertable = false, updatable = false)
    private User user;

    @Column(name = "PriceAfterBid", nullable = false)
    private Long priceAfterBid;

    @Column(name = "BidAt", nullable = false)
    private LocalDateTime bidAt;
}
