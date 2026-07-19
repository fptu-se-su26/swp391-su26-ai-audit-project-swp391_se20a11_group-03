package com.auction.wallet.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Transactions")
@Getter
@Setter
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TransactionId")
    private Long transactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WalletId", nullable = false)
    private Wallet wallet;

    @Column(name = "Amount", nullable = false)
    private Long amount;

    @Column(name = "TransactionType", nullable = false)
    private String transactionType;

    @Column(name = "Status", nullable = false)
    private String status;

    @Column(name = "ReferenceCode")
    private String referenceCode;

    @Column(name = "Description")
    private String description;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    public Transaction() {}

    public Transaction(Wallet wallet, Long amount, String transactionType, String status, String referenceCode, String description, LocalDateTime createdAt) {
        this.wallet = wallet;
        this.amount = amount;
        this.transactionType = transactionType;
        this.status = status;
        this.referenceCode = referenceCode;
        this.description = description;
        this.createdAt = createdAt;
    }
}
