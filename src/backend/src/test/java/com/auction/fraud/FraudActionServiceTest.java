package com.auction.fraud;

import com.auction.bidding.entity.Bid;
import com.auction.fraud.entity.*;
import com.auction.fraud.model.FraudSignal;
import com.auction.fraud.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class FraudActionServiceTest {
    private FraudConfigService config;
    private FraudAlertService alerts;
    private UserRestrictionService restrictions;
    private SimpMessagingTemplate messaging;
    private FraudActionService service;
    private Bid bid;

    @BeforeEach
    void setUp() {
        config = mock(FraudConfigService.class);
        alerts = mock(FraudAlertService.class);
        restrictions = mock(UserRestrictionService.class);
        messaging = mock(SimpMessagingTemplate.class);
        service = new FraudActionService(config, alerts, restrictions,
                mock(FraudAuditService.class), messaging);
        bid = new Bid();
        bid.setBidId(1L);
        bid.setAuctionId(2L);
        bid.setUserId(3L);
        bid.setBidTime(LocalDateTime.now());
    }

    @Test
    void autoRestrictionOffOnlyCreatesAlert() {
        when(config.isAutoRestrictionEnabled()).thenReturn(false);
        when(config.isAlertEnabled()).thenReturn(false);
        when(alerts.createOrUpdate(any(), anyList(), eq(50), eq(FraudRiskLevel.HIGH), eq(FraudAction.WARN_ADMIN)))
                .thenReturn(alert(FraudRiskLevel.HIGH));

        service.process(bid, signals(), 50);

        verifyNoInteractions(restrictions);
        verifyNoInteractions(messaging);
    }

    @Test
    void highRiskRestrictsBiddingWhenEnabled() {
        when(config.isAutoRestrictionEnabled()).thenReturn(true);
        when(config.isAlertEnabled()).thenReturn(false);
        when(alerts.createOrUpdate(any(), anyList(), eq(50), eq(FraudRiskLevel.HIGH),
                eq(FraudAction.TEMPORARY_BID_RESTRICTION))).thenReturn(alert(FraudRiskLevel.HIGH));

        service.process(bid, signals(), 50);

        verify(restrictions).restrictBidding(eq(3L), any(), eq(9L));
        verify(restrictions, never()).suspendAccount(anyLong(), anyLong());
    }

    @Test
    void criticalRiskSuspendsAccountWhenEnabled() {
        when(config.isAutoRestrictionEnabled()).thenReturn(true);
        when(config.isAlertEnabled()).thenReturn(false);
        when(alerts.createOrUpdate(any(), anyList(), eq(80), eq(FraudRiskLevel.CRITICAL),
                eq(FraudAction.TEMPORARY_ACCOUNT_SUSPENSION))).thenReturn(alert(FraudRiskLevel.CRITICAL));

        service.process(bid, signals(), 80);

        verify(restrictions).suspendAccount(3L, 9L);
        verify(restrictions, never()).restrictBidding(anyLong(), any(), anyLong());
    }

    private static List<FraudSignal> signals() {
        return List.of(new FraudSignal(FraudType.SHARED_DEVICE, 35, "shared device"));
    }

    private FraudAlert alert(FraudRiskLevel level) {
        FraudAlert alert = new FraudAlert();
        alert.setId(9L);
        alert.setAuctionId(2L);
        alert.setSuspectedUserId(3L);
        alert.setRiskLevel(level);
        alert.setRiskScore(level == FraudRiskLevel.CRITICAL ? 80 : 50);
        alert.setStatus(FraudAlertStatus.PENDING);
        alert.setAutomaticAction(FraudAction.WARN_ADMIN);
        alert.setFraudType("SHARED_DEVICE");
        alert.setSignals("SHARED_DEVICE");
        alert.setDescription("shared device");
        alert.setOccurrenceCount(1);
        alert.setFirstDetectedAt(LocalDateTime.now());
        alert.setLastDetectedAt(LocalDateTime.now());
        return alert;
    }
}
