package com.swp391.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * @author Pham Manh Thang
 */
@Entity
@Table(name = "Transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    @Column(name = "TransactionType", nullable = false, length = 50)
    private String transactionType;

    @Column(name = "Status", nullable = false, length = 30)
    private String status;

    @Column(name = "ReferenceCode", length = 100)
    private String referenceCode;

    @Column(name = "Description", length = 500)
    private String description;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;
}
