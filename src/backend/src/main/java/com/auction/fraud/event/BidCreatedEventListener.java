package com.auction.fraud.event;

import com.auction.fraud.service.FraudDetectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class BidCreatedEventListener {
    private final FraudDetectionService fraudDetectionService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(BidCreatedEvent event) {
        fraudDetectionService.analyzeBid(event.bidId());
    }
}
