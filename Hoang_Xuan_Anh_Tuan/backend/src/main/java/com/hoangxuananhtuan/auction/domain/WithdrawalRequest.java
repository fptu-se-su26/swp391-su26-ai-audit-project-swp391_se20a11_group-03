package com.hoangxuananhtuan.auction.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "WithdrawalRequests")
@Getter
@Setter
public class WithdrawalRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "WithdrawalRequestId")
    private Long withdrawalRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WalletId", nullable = false)
    private Wallet wallet;

    @Column(name = "Amount", nullable = false)
    private Long amount;

    @Column(name = "BankAccount", nullable = false)
    private String bankAccount;

    @Column(name = "BankName", nullable = false)
    private String bankName;

    @Column(name = "AccountHolder", nullable = false)
    private String accountHolder;

    @Column(name = "Status", nullable = false)
    private String status;

    @Column(name = "ReviewedBy")
    private Long reviewedBy;

    @Column(name = "ReviewedAt")
    private LocalDateTime reviewedAt;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}
