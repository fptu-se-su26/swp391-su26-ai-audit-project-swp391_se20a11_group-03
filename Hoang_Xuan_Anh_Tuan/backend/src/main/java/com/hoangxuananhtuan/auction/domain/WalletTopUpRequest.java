package com.hoangxuananhtuan.auction.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "WalletTopUpRequests")
@Getter
@Setter
public class WalletTopUpRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TopUpRequestId")
    private Long topUpRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WalletId", nullable = false)
    private Wallet wallet;

    @Column(name = "Amount", nullable = false)
    private Long amount;

    @Column(name = "PaymentMethod", nullable = false)
    private String paymentMethod;

    @Column(name = "ReferenceCode")
    private String referenceCode;

    @Column(name = "Status", nullable = false)
    private String status;

    @Column(name = "ReviewedBy")
    private Long reviewedBy;

    @Column(name = "ReviewedAt")
    private LocalDateTime reviewedAt;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}
