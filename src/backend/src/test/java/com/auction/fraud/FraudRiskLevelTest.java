package com.auction.fraud;

import com.auction.fraud.entity.FraudRiskLevel;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class FraudRiskLevelTest {
    @Test
    void mapsBoundaryScores() {
        assertEquals(FraudRiskLevel.LOW, FraudRiskLevel.fromScore(29));
        assertEquals(FraudRiskLevel.MEDIUM, FraudRiskLevel.fromScore(30));
        assertEquals(FraudRiskLevel.MEDIUM, FraudRiskLevel.fromScore(49));
        assertEquals(FraudRiskLevel.HIGH, FraudRiskLevel.fromScore(50));
        assertEquals(FraudRiskLevel.HIGH, FraudRiskLevel.fromScore(79));
        assertEquals(FraudRiskLevel.CRITICAL, FraudRiskLevel.fromScore(80));
    }
}
