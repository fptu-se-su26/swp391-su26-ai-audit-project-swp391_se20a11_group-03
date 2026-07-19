package com.auction.account.entity;

public enum VerificationStatus {
    PENDING_PROFILE,
    PENDING_EMAIL_VERIFY,
    PENDING_PHONE_VERIFY,
    PENDING_IDENTITY_VERIFY,
    ACTIVE,
    VERIFIED,
    LOCKED,
    REJECTED
}


