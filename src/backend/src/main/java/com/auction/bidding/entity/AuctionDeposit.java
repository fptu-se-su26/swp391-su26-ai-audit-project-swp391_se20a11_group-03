package com.auction.bidding.entity;

import com.auction.account.entity.User;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Auction_Deposits", uniqueConstraints = @UniqueConstraint(columnNames = {"AuctionId", "UserId"}))
@Getter
@Setter
public class AuctionDeposit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DepositId")
    private Long depositId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "AuctionId", nullable = false)
    private Auction auction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", nullable = false)
    private User user;

    @Column(name = "DepositAmount", nullable = false)
    private Long depositAmount;

    @Column(name = "Status", nullable = false)
    private String status;

    @Column(name = "SettlementType", length = 20)
    private String settlementType;

    @Column(name = "SettledAt")
    private LocalDateTime settledAt;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    public AuctionDeposit() {}

    public AuctionDeposit(Auction auction, User user, Long depositAmount, String status, LocalDateTime createdAt) {
        this.auction = auction;
        this.user = user;
        this.depositAmount = depositAmount;
        this.status = status;
        this.createdAt = createdAt;
    }
}
