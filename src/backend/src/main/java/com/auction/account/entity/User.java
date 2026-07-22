package com.auction.account.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserId")
    private int id;

    @Column(name = "FullName", nullable = false, length = 150)
    private String fullName;

    @Column(name = "Email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "Phone", unique = true, length = 20)
    private String phone;

    @Column(name = "PhoneVerified", nullable = false)
    private boolean phoneVerified;

    @Column(name = "PhoneVerifiedAt")
    private LocalDateTime phoneVerifiedAt;

    @Column(name = "IdentityNumber", length = 20)
    private String identityNumber;

    @Column(name = "PasswordHash", nullable = false, length = 128)
    private String passwordHash;

    @Column(name = "Salt", nullable = false, length = 32)
    private String salt;

    @Column(name = "PasswordIterations", nullable = false)
    private int passwordIterations;

    @Column(name = "EmailVerified", nullable = false)
    private boolean emailVerified;

    @Column(name = "EmailVerifiedAt")
    private LocalDateTime emailVerifiedAt;

    @Column(name = "IdentityVerified", nullable = false)
    private boolean identityVerified;

    @Column(name = "IdentityVerifiedAt")
    private LocalDateTime identityVerifiedAt;

    @Column(name = "VerificationLevel", nullable = false)
    private byte verificationLevel;

    @Column(name = "ProfileStatus", nullable = false, length = 30)
    private String profileStatus;

    @Column(name = "IsActive", nullable = false)
    private boolean active = true;

    @Column(name = "AuthProvider", nullable = false, length = 30)
    private String authProvider;

    @Column(name = "Status", nullable = false, length = 30)
    private String status;

    @Column(name = "Username", length = 255)
    private String username;

    @Column(name = "PaymentStrikeCount", nullable = false)
    private int paymentStrikeCount = 0;

    @Column(name = "LockedByPaymentStrikes", nullable = false)
    private boolean lockedByPaymentStrikes = false;

    @Column(name = "BidRestrictedUntil")
    private LocalDateTime bidRestrictedUntil;

    @Column(name = "SuspendedAt")
    private LocalDateTime suspendedAt;

    @Column(name = "SuspensionReason", length = 500)
    private String suspensionReason;

    @Column(name = "BannedAt")
    private LocalDateTime bannedAt;

    @Column(name = "BannedBy")
    private Long bannedBy;

    @Column(name = "AiValuationUsedCount", nullable = false)
    private int aiValuationUsedCount = 0;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "RoleId")
    private Role role;

    public User() {
    }

    public User(String fullName, String email, String phone, String identityNumber, String passwordHash, String salt, int passwordIterations) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.identityNumber = identityNumber;
        this.passwordHash = passwordHash;
        this.salt = salt;
        this.passwordIterations = passwordIterations;
        this.emailVerified = false;
        this.phoneVerified = false;
        this.identityVerified = false;
        this.verificationLevel = 0;
        this.profileStatus = "PENDING_PROFILE";
        this.active = true;
        this.authProvider = "LOCAL";
        this.status = "ACTIVE";
        this.username = email;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public boolean isPhoneVerified() {
        return phoneVerified;
    }

    public void setPhoneVerified(boolean phoneVerified) {
        this.phoneVerified = phoneVerified;
    }

    public LocalDateTime getPhoneVerifiedAt() {
        return phoneVerifiedAt;
    }

    public void setPhoneVerifiedAt(LocalDateTime phoneVerifiedAt) {
        this.phoneVerifiedAt = phoneVerifiedAt;
    }

    public String getIdentityNumber() {
        return identityNumber;
    }

    public void setIdentityNumber(String identityNumber) {
        this.identityNumber = identityNumber;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }

    public int getPasswordIterations() {
        return passwordIterations;
    }

    public void setPasswordIterations(int passwordIterations) {
        this.passwordIterations = passwordIterations;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public LocalDateTime getEmailVerifiedAt() {
        return emailVerifiedAt;
    }

    public void setEmailVerifiedAt(LocalDateTime emailVerifiedAt) {
        this.emailVerifiedAt = emailVerifiedAt;
    }

    public boolean isIdentityVerified() {
        return identityVerified;
    }

    public void setIdentityVerified(boolean identityVerified) {
        this.identityVerified = identityVerified;
    }

    public LocalDateTime getIdentityVerifiedAt() {
        return identityVerifiedAt;
    }

    public void setIdentityVerifiedAt(LocalDateTime identityVerifiedAt) {
        this.identityVerifiedAt = identityVerifiedAt;
    }

    public byte getVerificationLevel() {
        return verificationLevel;
    }

    public void setVerificationLevel(byte verificationLevel) {
        this.verificationLevel = verificationLevel;
    }

    public String getProfileStatus() {
        return profileStatus;
    }

    public void setProfileStatus(String profileStatus) {
        this.profileStatus = profileStatus;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getAuthProvider() {
        return authProvider;
    }

    public void setAuthProvider(String authProvider) {
        this.authProvider = authProvider;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Transient
    public Long getUserId() {
        return (long) id;
    }

    public String getUsername() {
        return username != null && !username.isBlank() ? username : email;
    }

    public String getStatus() {
        if (status != null && !status.isBlank()) {
            return status;
        }
        return active ? "ACTIVE" : "LOCKED";
    }

    public Role getRole() {
        return role != null ? role : new Role(1, "User");
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public int getPaymentStrikeCount() {
        return paymentStrikeCount;
    }

    public void setPaymentStrikeCount(int paymentStrikeCount) {
        this.paymentStrikeCount = paymentStrikeCount;
    }

    public boolean isLockedByPaymentStrikes() {
        return lockedByPaymentStrikes;
    }

    public void setLockedByPaymentStrikes(boolean lockedByPaymentStrikes) {
        this.lockedByPaymentStrikes = lockedByPaymentStrikes;
    }

    public LocalDateTime getBidRestrictedUntil() { return bidRestrictedUntil; }
    public void setBidRestrictedUntil(LocalDateTime bidRestrictedUntil) { this.bidRestrictedUntil = bidRestrictedUntil; }
    public LocalDateTime getSuspendedAt() { return suspendedAt; }
    public void setSuspendedAt(LocalDateTime suspendedAt) { this.suspendedAt = suspendedAt; }
    public String getSuspensionReason() { return suspensionReason; }
    public void setSuspensionReason(String suspensionReason) { this.suspensionReason = suspensionReason; }
    public LocalDateTime getBannedAt() { return bannedAt; }
    public void setBannedAt(LocalDateTime bannedAt) { this.bannedAt = bannedAt; }
    public Long getBannedBy() { return bannedBy; }
    public void setBannedBy(Long bannedBy) { this.bannedBy = bannedBy; }
    public int getAiValuationUsedCount() { return aiValuationUsedCount; }
    public void setAiValuationUsedCount(int aiValuationUsedCount) { this.aiValuationUsedCount = aiValuationUsedCount; }
}


