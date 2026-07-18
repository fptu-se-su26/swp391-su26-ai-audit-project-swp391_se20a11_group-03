package com.auction.account.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "PendingEmailVerifications")
public class PendingEmailVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "VerificationId")
    private long id;

    @Column(name = "Email", nullable = false, length = 255)
    private String email;

    @Column(name = "OtpSalt", nullable = false, length = 64)
    private String otpSalt;

    @Column(name = "OtpHash", nullable = false, length = 64)
    private String otpHash;

    @Column(name = "RegistrationTokenHash", length = 64)
    private String registrationTokenHash;

    @Column(name = "AttemptCount", nullable = false)
    private int attemptCount;

    @Column(name = "ExpiresAt", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "VerifiedAt")
    private LocalDateTime verifiedAt;

    @Column(name = "ConsumedAt")
    private LocalDateTime consumedAt;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    public long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtpSalt() {
        return otpSalt;
    }

    public void setOtpSalt(String otpSalt) {
        this.otpSalt = otpSalt;
    }

    public String getOtpHash() {
        return otpHash;
    }

    public void setOtpHash(String otpHash) {
        this.otpHash = otpHash;
    }

    public String getRegistrationTokenHash() {
        return registrationTokenHash;
    }

    public void setRegistrationTokenHash(String registrationTokenHash) {
        this.registrationTokenHash = registrationTokenHash;
    }

    public int getAttemptCount() {
        return attemptCount;
    }

    public void setAttemptCount(int attemptCount) {
        this.attemptCount = attemptCount;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public LocalDateTime getConsumedAt() {
        return consumedAt;
    }

    public void setConsumedAt(LocalDateTime consumedAt) {
        this.consumedAt = consumedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
