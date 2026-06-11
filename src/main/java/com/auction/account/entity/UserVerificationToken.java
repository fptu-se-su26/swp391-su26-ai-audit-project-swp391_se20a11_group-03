package com.auction.account.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "UserVerificationTokens")
public class UserVerificationToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VerificationTokenID")
    private long id;

    @ManyToOne
    @JoinColumn(name = "UserID", nullable = false)
    private User user;

    @Column(name = "TokenHash", nullable = false, length = 128)
    private String tokenHash;

    @Column(name = "TokenType", nullable = false, length = 30)
    private String tokenType;

    @Column(name = "ExpiresAt", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "UsedAt")
    private LocalDateTime usedAt;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    public UserVerificationToken() {
    }

    public UserVerificationToken(User user, String tokenHash, String tokenType, LocalDateTime expiresAt, LocalDateTime createdAt) {
        this.user = user;
        this.tokenHash = tokenHash;
        this.tokenType = tokenType;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
    }

    public long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public String getTokenType() {
        return tokenType;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(LocalDateTime usedAt) {
        this.usedAt = usedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}


