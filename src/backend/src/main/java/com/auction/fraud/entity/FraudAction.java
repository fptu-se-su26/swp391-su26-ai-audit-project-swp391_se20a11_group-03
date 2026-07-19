package com.auction.fraud.entity;

public enum FraudAction {
    LOG_ONLY,
    WARN_ADMIN,
    TEMPORARY_BID_RESTRICTION,
    TEMPORARY_ACCOUNT_SUSPENSION,
    REQUIRE_ADMIN_REVIEW,
    PERMANENT_BAN
}
