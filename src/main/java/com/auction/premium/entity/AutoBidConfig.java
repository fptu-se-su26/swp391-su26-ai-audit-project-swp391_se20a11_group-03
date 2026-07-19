package com.auction.premium.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "AutoBidConfigs", schema = "dbo", uniqueConstraints = @UniqueConstraint(columnNames = {"BuyerId", "AuctionId"}))
@Getter @Setter
public class AutoBidConfig {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AutoBidConfigId") private Long id;
    @Column(name = "BuyerId", nullable = false) private Long buyerId;
    @Column(name = "AuctionId", nullable = false) private Long auctionId;
    @Column(name = "MaxPrice", nullable = false) private Long maxPrice;
    @Column(name = "IsActive", nullable = false) private boolean active = true;
}
