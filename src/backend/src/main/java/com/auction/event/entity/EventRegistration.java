package com.auction.event.entity;

import com.auction.account.entity.User;
import com.auction.event.enums.EventRegistrationRole;
import com.auction.event.enums.EventRegistrationStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "EventRegistrations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"EventId", "UserId"})
})
@Getter
@Setter
public class EventRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RegistrationId")
    private Long registrationId;

    @Column(name = "EventId", nullable = false)
    private Long eventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EventId", insertable = false, updatable = false)
    private AuctionEvent event;

    @Column(name = "UserId", nullable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", insertable = false, updatable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "Role", nullable = false, length = 20)
    private EventRegistrationRole role;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false, length = 20)
    private EventRegistrationStatus status = EventRegistrationStatus.REGISTERED;

    @Column(name = "RegisteredAt", nullable = false)
    private LocalDateTime registeredAt;

    @Column(name = "NotifyOnOpen", nullable = false)
    private boolean notifyOnOpen = true;

    /** Real-money deposit held in the bidder's wallet for a VIRTUAL-money event (0/null for REAL). */
    @Column(name = "DepositAmount")
    private Long depositAmount;

    /** NONE | HELD | REFUNDED | FORFEITED — lifecycle of the registration deposit. */
    @Column(name = "DepositStatus", length = 20)
    private String depositStatus;
}
