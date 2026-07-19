package com.auction.notification.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * System notification entity for user alerts.
 */
@Entity
@Table(name = "Notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NotificationId")
    private Long notificationId;

    @Column(name = "UserId", nullable = false)
    private Long userId;

    @Column(name = "Title", nullable = false, length = 200)
    private String title;

    @Column(name = "Message", nullable = false, length = 1000)
    private String message;

    @Column(name = "Type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private NotificationType type = NotificationType.GENERAL;

    @Column(name = "ReferenceId")
    private Long referenceId;

    @Column(name = "ReferenceType", length = 50)
    private String referenceType;

    @Column(name = "IsRead", nullable = false)
    private Boolean isRead = false;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public enum NotificationType {
        PRODUCT_APPROVED,
        PRODUCT_REJECTED,
        AUCTION_STARTING,
        AUCTION_ENDING,
        OUTBID,
        PAYMENT_REQUIRED,
        KYC_APPROVED,
        KYC_REJECTED,
        WITHDRAWAL_APPROVED,
        WITHDRAWAL_REJECTED,
        BID_PLACED,
        ORDER_CREATED,
        ORDER_ASSIGNED,
        ORDER_STATUS_UPDATED,
        ORDER_DELIVERED,
        ORDER_COMPLETED,
        ORDER_FAILED,
        GENERAL,
        EVENT_PUBLISHED,
        EVENT_ONGOING,
        EVENT_CANCELLED,
        EVENT_ENDED,
        EVENT_WON,
        EVENT_LOST
    }
}
