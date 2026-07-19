package com.auction.order.entity;

import com.auction.account.entity.User;
import com.auction.bidding.entity.Auction;
import com.auction.product.entity.Product;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "Orders")
@Getter @Setter
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OrderId") private Long orderId;
    @OneToOne(fetch = FetchType.LAZY) @JoinColumn(name = "AuctionId", nullable = false, unique = true)
    private Auction auction;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "BuyerId", nullable = false) private User buyer;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "SellerId", nullable = false) private User seller;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ShipperId") private User shipper;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ProductId", nullable = false) private Product product;
    @Column(name = "FinalPrice", nullable = false) private Long finalPrice;
    @Column(name = "ShippingFee", nullable = false) private Long shippingFee;
    @Column(name = "ReceiverName", nullable = false, length = 150) private String receiverName;
    @Column(name = "ReceiverPhone", nullable = false, length = 30) private String receiverPhone;
    @Column(name = "AddressLine", nullable = false, length = 255) private String addressLine;
    @Column(name = "Ward", nullable = false, length = 120) private String ward;
    @Column(name = "District", nullable = false, length = 120) private String district;
    @Column(name = "Province", nullable = false, length = 120) private String province;
    @Column(name = "Note", length = 500) private String note;
    @Enumerated(EnumType.STRING) @Column(name = "Status", nullable = false, length = 30)
    private OrderStatus status = OrderStatus.PENDING_PICKUP;
    @Column(name = "AssignedAt") private LocalDateTime assignedAt;
    @Column(name = "DeliveredAt") private LocalDateTime deliveredAt;
    @Column(name = "PayoutReleasedAt") private LocalDateTime payoutReleasedAt;
    @Column(name = "CreatedAt", nullable = false) private LocalDateTime createdAt;
    @Column(name = "UpdatedAt", nullable = false) private LocalDateTime updatedAt;
    @PrePersist void create() { LocalDateTime now = LocalDateTime.now(); if (createdAt == null) createdAt = now; updatedAt = now; }
    @PreUpdate void update() { updatedAt = LocalDateTime.now(); }
}
