package com.auction.fraud.service;

import com.auction.bidding.entity.Bid;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.fraud.entity.*;
import com.auction.fraud.model.FraudSignal;
import com.auction.fraud.repository.FraudAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FraudAlertService {
    private static final List<FraudAlertStatus> OPEN_STATUSES =
            List.of(FraudAlertStatus.PENDING, FraudAlertStatus.REVIEWING);

    private final FraudAlertRepository alertRepository;

    @Transactional
    public FraudAlert createOrUpdate(Bid bid, List<FraudSignal> signals, int score,
                                     FraudRiskLevel level, FraudAction action) {
        LocalDateTime now = LocalDateTime.now();
        FraudAlert alert = alertRepository
                .findFirstByAuctionIdAndSuspectedUserIdAndStatusInOrderByLastDetectedAtDesc(
                        bid.getAuctionId(), bid.getUserId(), OPEN_STATUSES)
                .orElseGet(() -> {
                    FraudAlert created = new FraudAlert();
                    created.setAuctionId(bid.getAuctionId());
                    created.setSuspectedUserId(bid.getUserId());
                    created.setStatus(FraudAlertStatus.PENDING);
                    created.setOccurrenceCount(0);
                    created.setFirstDetectedAt(now);
                    return created;
                });
        alert.setTriggerBidId(bid.getBidId());
        alert.setFraudType(signals.stream().map(signal -> signal.type().name()).collect(Collectors.joining(",")));
        alert.setSignals(alert.getFraudType());
        alert.setRiskScore(score);
        alert.setRiskLevel(level);
        alert.setDescription(signals.stream().map(FraudSignal::description).collect(Collectors.joining("; ")));
        alert.setAutomaticAction(action);
        alert.setOccurrenceCount(alert.getOccurrenceCount() + 1);
        alert.setLastDetectedAt(now);
        return alertRepository.save(alert);
    }

    public FraudAlert get(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fraud alert not found: " + id));
    }
}
