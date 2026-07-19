package com.auction.fraud.entity;

public enum FraudRiskLevel {
    LOW,
    MEDIUM,
    HIGH,
    CRITICAL;

    public static FraudRiskLevel fromScore(int score) {
        if (score >= 80) return CRITICAL;
        if (score >= 50) return HIGH;
        if (score >= 30) return MEDIUM;
        return LOW;
    }
}
