package com.auction.wallet.entity;

import com.auction.account.entity.User;
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
    @JoinColumn(name = "UserId", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "WalletId", nullable = false)
    private Wallet wallet;

    @Column(name = "Amount", nullable = false)
    private Long amount;

    @Column(name = "BankName", nullable = false, length = 120)
    private String bankName;

    @Column(name = "AccountNumber", nullable = false, length = 60)
    private String accountNumber;

    @Column(name = "AccountName", nullable = false, length = 150)
    private String accountName;

    @Column(name = "Status", nullable = false, length = 30)
    private String status;

    @Column(name = "StaffNote", length = 500)
    private String staffNote;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;
}
