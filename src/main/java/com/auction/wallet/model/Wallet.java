package com.hoangxuananhtuan.auction.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Wallets")
@Getter
@Setter
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "WalletId")
    private Long walletId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "UserId", nullable = false, unique = true)
    private User user;

    @Column(name = "Balance", nullable = false)
    private Long balance;

    @Column(name = "HoldBalance", nullable = false)
    private Long holdBalance;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;
}


