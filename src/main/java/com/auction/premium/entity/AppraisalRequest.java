package com.auction.premium.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity @Table(name = "AppraisalRequests", schema = "dbo") @Getter @Setter
public class AppraisalRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AppraisalRequestId") private Long id;
    @Column(name = "SellerId", nullable = false) private Long sellerId;
    @Column(name = "ProductId", nullable = false) private Long productId;
    @Column(name = "RequestDate", nullable = false) private LocalDateTime requestDate;
    @Enumerated(EnumType.STRING) @Column(name = "Status", nullable = false, length = 30)
    private AppraisalStatus status;
    @Column(name = "RecommendedPrice") private Long recommendedPrice;
    @Column(name = "ExpertNote", length = 1000) private String expertNote;
}
