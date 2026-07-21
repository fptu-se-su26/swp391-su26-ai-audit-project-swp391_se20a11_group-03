package com.auction.event.entity;

import com.auction.account.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "SealedBids", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"EventProductId", "UserId"})
})
@Getter
@Setter
public class SealedBid {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SealedBidId")
    private Long sealedBidId;

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

    @Column(name = "BidAmount", nullable = false)
    private Long bidAmount;

    @Column(name = "SubmittedAt", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;

    @Column(name = "Revealed", nullable = false)
    private boolean revealed = false;
}
