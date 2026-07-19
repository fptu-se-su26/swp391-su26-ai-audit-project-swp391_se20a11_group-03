package com.auction.order.entity;

import com.auction.account.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "OrderStatusHistory")
@Getter @Setter
public class OrderStatusHistory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "HistoryId") private Long historyId;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "OrderId", nullable = false) private Order order;
    @Enumerated(EnumType.STRING) @Column(name = "FromStatus", length = 30) private OrderStatus fromStatus;
    @Enumerated(EnumType.STRING) @Column(name = "ToStatus", nullable = false, length = 30) private OrderStatus toStatus;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "ChangedBy") private User changedBy;
    @Column(name = "Note", length = 500) private String note;
    @Column(name = "CreatedAt", nullable = false) private LocalDateTime createdAt;
    @PrePersist void create() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
