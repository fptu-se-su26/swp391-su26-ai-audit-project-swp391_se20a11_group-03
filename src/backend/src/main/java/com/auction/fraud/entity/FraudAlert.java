package com.auction.fraud.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "FraudAlerts")
@Getter
@Setter
public class FraudAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "FraudAlertId")
    private Long id;

    @Column(name = "AuctionId", nullable = false)
    private Long auctionId;

    @Column(name = "SuspectedUserId", nullable = false)
    private Long suspectedUserId;

    @Column(name = "TriggerBidId")
    private Long triggerBidId;

    @Column(name = "FraudType", nullable = false, length = 100)
    private String fraudType;

    @Column(name = "Signals", nullable = false, length = 1000)
    private String signals;

    @Column(name = "RiskScore", nullable = false)
    private int riskScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "RiskLevel", nullable = false, length = 20)
    private FraudRiskLevel riskLevel;

    @Column(name = "Description", nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false, length = 20)
    private FraudAlertStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "AutomaticAction", nullable = false, length = 50)
    private FraudAction automaticAction;

    @Column(name = "OccurrenceCount", nullable = false)
    private int occurrenceCount;

    @Column(name = "FirstDetectedAt", nullable = false)
    private LocalDateTime firstDetectedAt;

    @Column(name = "LastDetectedAt", nullable = false)
    private LocalDateTime lastDetectedAt;

    @Column(name = "ReviewedBy")
    private Long reviewedBy;

    @Column(name = "ReviewedAt")
    private LocalDateTime reviewedAt;

    @Column(name = "AdminNote", length = 1000)
    private String adminNote;
}
