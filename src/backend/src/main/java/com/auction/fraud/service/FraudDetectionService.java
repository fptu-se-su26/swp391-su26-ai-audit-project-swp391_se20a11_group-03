package com.auction.fraud.service;

import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.Bid;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.repository.BidRepository;
import com.auction.fraud.entity.FraudType;
import com.auction.fraud.model.FraudSignal;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {
    private final FraudConfigService configService;
    private final BidRepository bidRepository;
    private final AuctionSessionRepository auctionRepository;
    private final ProductRepository productRepository;
    private final FraudActionService actionService;

    @Transactional
    public void analyzeBid(Long bidId) {
        if (!configService.isDetectionEnabled() || bidId == null) return;
        Bid bid = bidRepository.findById(bidId).orElse(null);
        if (bid == null) return;

        List<FraudSignal> signals = new ArrayList<>();
        detectSharedIp(bid, signals);
        detectSharedDevice(bid, signals);
        detectRapidBidding(bid, signals);
        detectRepeatedBiddingPair(bid, signals);
        detectSellerLinkedAccount(bid, signals);
        if (signals.isEmpty()) return;

        int score = signals.stream().mapToInt(FraudSignal::score).sum();
        actionService.process(bid, signals, score);
    }

    private void detectSharedIp(Bid bid, List<FraudSignal> signals) {
        if (blank(bid.getIpAddress())) return;
        long users = bidRepository.countDistinctUsersByAuctionAndIpSince(
                bid.getAuctionId(), bid.getIpAddress(), bid.getBidTime().minusMinutes(10));
        if (users >= 3) {
            signals.add(new FraudSignal(FraudType.SHARED_IP, 20,
                    users + " accounts used the same IP in this auction within 10 minutes"));
        }
    }

    private void detectSharedDevice(Bid bid, List<FraudSignal> signals) {
        if (blank(bid.getDeviceHash())) return;
        long users = bidRepository.countDistinctUsersByAuctionAndDevice(bid.getAuctionId(), bid.getDeviceHash());
        if (users >= 2) {
            signals.add(new FraudSignal(FraudType.SHARED_DEVICE, 35,
                    users + " accounts used the same device in this auction"));
        }
    }

    private void detectRapidBidding(Bid bid, List<FraudSignal> signals) {
        LocalDateTime now = bid.getBidTime();
        long inThirtySeconds = bidRepository.findByUserIdAndBidTimeAfter(
                bid.getUserId(), now.minusSeconds(30)).size();
        long inOneMinute = bidRepository.findByUserIdAndBidTimeAfter(
                bid.getUserId(), now.minusMinutes(1)).size();
        if (inThirtySeconds >= 10 || inOneMinute >= 20) {
            signals.add(new FraudSignal(FraudType.RAPID_BIDDING, 15,
                    "Rapid bidding detected: " + inThirtySeconds + " bids/30s, " + inOneMinute + " bids/60s"));
        }
    }

    private void detectRepeatedBiddingPair(Bid bid, List<FraudSignal> signals) {
        List<Bid> recent = bidRepository.findTop20ByAuctionIdOrderByBidTimeDesc(bid.getAuctionId());
        if (recent.size() < 6) return;
        List<Bid> six = recent.subList(0, 6);
        Set<Long> users = new HashSet<>();
        boolean alternating = true;
        for (int i = 0; i < six.size(); i++) {
            users.add(six.get(i).getUserId());
            if (i > 0 && six.get(i).getUserId().equals(six.get(i - 1).getUserId())) alternating = false;
        }
        if (alternating && users.size() == 2) {
            signals.add(new FraudSignal(FraudType.REPEATED_BIDDING_PAIR, 25,
                    "Two accounts alternated bids for at least six consecutive turns"));
        }
    }

    private void detectSellerLinkedAccount(Bid bid, List<FraudSignal> signals) {
        AuctionSession auction = auctionRepository.findById(bid.getAuctionId()).orElse(null);
        if (auction == null) return;
        Product product = productRepository.findById(auction.getProductId()).orElse(null);
        if (product == null || product.getSellerId() == null) return;
        Long sellerId = product.getSellerId();

        boolean sharedDevice = !blank(bid.getDeviceHash())
                && bidRepository.countByUserIdAndDeviceHash(sellerId, bid.getDeviceHash()) > 0;
        boolean sharedIp = !blank(bid.getIpAddress())
                && bidRepository.countByUserIdAndIpAddress(sellerId, bid.getIpAddress()) >= 2;
        boolean repeatedSeller = bidRepository.countDistinctAuctionsBidByUserForSeller(bid.getUserId(), sellerId) >= 3;
        if (sharedDevice || sharedIp || repeatedSeller) {
            signals.add(new FraudSignal(FraudType.SELLER_LINKED_ACCOUNT, 40,
                    "Bidder is linked to seller by "
                            + (sharedDevice ? "device" : sharedIp ? "repeated IP" : "repeated auction behavior")));
        }
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
