package com.auction.fraud;

import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.repository.BidRepository;
import com.auction.fraud.service.FraudActionService;
import com.auction.fraud.service.FraudConfigService;
import com.auction.fraud.service.FraudDetectionService;
import com.auction.product.repository.ProductRepository;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;

class FraudDetectionServiceTest {
    @Test
    void detectionOffSkipsBidAnalysis() {
        FraudConfigService config = mock(FraudConfigService.class);
        BidRepository bids = mock(BidRepository.class);
        when(config.isDetectionEnabled()).thenReturn(false);
        FraudDetectionService service = new FraudDetectionService(
                config, bids, mock(AuctionSessionRepository.class),
                mock(ProductRepository.class), mock(FraudActionService.class));

        service.analyzeBid(10L);

        verify(bids, never()).findById(anyLong());
    }
}
