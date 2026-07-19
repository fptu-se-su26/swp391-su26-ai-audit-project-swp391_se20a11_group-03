package com.auction.bidding.entity;

import com.auction.account.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Auction_Chat_Messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuctionChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "MessageId")
    private Long messageId;

    @Column(name = "AuctionId", nullable = false)
    private Long auctionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SenderId", nullable = false)
    private User sender;

    @Column(name = "Content", nullable = false, columnDefinition = "NVARCHAR(1000)")
    private String content;

    @Column(name = "SentAt", nullable = false, updatable = false)
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) {
            sentAt = LocalDateTime.now();
        }
    }
}
