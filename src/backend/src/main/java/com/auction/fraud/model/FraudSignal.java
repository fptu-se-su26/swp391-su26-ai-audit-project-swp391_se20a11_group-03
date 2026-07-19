package com.auction.fraud.model;

import com.auction.fraud.entity.FraudType;

public record FraudSignal(FraudType type, int score, String description) {
}
