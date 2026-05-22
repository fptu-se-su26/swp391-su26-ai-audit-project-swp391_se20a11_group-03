package com.example.biddingmodule.service;

import com.example.biddingmodule.dto.BidRequest;
import com.example.biddingmodule.dto.BidResponse;
import com.example.biddingmodule.entity.AuctionSession;
import com.example.biddingmodule.entity.AuctionStatus;
import com.example.biddingmodule.entity.Bid;
import com.example.biddingmodule.repository.AuctionSessionRepository;
import com.example.biddingmodule.repository.BidRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

class BiddingServiceTest {

    @Test
    void twoUsersBidAtSameTime_firstRequestWins_secondRejected() throws Exception {
        InMemoryAuctionSessionRepository auctionRepo = new InMemoryAuctionSessionRepository();
        InMemoryBidRepository bidRepo = new InMemoryBidRepository();
        BiddingService service = new BiddingService(auctionRepo, bidRepo);

        AuctionSession auction = service.createDefaultAuctionSession(1L, 10L, LocalDateTime.now().minusSeconds(30));
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setCurrentHighestBid(10_000_000L);
        auctionRepo.save(auction);

        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(2);
        AtomicInteger successCount = new AtomicInteger(0);

        ExecutorService executor = Executors.newFixedThreadPool(2);
        executor.submit(() -> runBid(service, start, done, successCount, 1L));
        executor.submit(() -> runBid(service, start, done, successCount, 2L));

        start.countDown();
        Assertions.assertTrue(done.await(5, TimeUnit.SECONDS));
        executor.shutdownNow();

        Assertions.assertEquals(1, successCount.get());
        Assertions.assertEquals(1, bidRepo.savedCount);
        Assertions.assertEquals(11_000_000L, auctionRepo.savedAuction.getCurrentHighestBid());
    }

    @Test
    void successfulBid_extendsEndTimeBy10Seconds() {
        InMemoryAuctionSessionRepository auctionRepo = new InMemoryAuctionSessionRepository();
        InMemoryBidRepository bidRepo = new InMemoryBidRepository();
        BiddingService service = new BiddingService(auctionRepo, bidRepo);

        LocalDateTime start = LocalDateTime.now().minusSeconds(10);
        AuctionSession auction = service.createDefaultAuctionSession(2L, 20L, start);
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setCurrentHighestBid(5_000_000L);
        LocalDateTime originalEnd = auction.getEndTime();
        auctionRepo.save(auction);

        BidResponse response = service.placeBid(makeRequest(2L, 3L, 6_000_000L));

        Assertions.assertTrue(response.isSuccess());
        Assertions.assertEquals(originalEnd.plusSeconds(10), auctionRepo.savedAuction.getEndTime());
    }

    @Test
    void bidBelowMinimumIncrement_isRejectedWithCorrectMessage() {
        InMemoryAuctionSessionRepository auctionRepo = new InMemoryAuctionSessionRepository();
        InMemoryBidRepository bidRepo = new InMemoryBidRepository();
        BiddingService service = new BiddingService(auctionRepo, bidRepo);

        AuctionSession auction = service.createDefaultAuctionSession(3L, 30L, LocalDateTime.now().minusSeconds(10));
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setCurrentHighestBid(10_000_000L);
        auctionRepo.save(auction);

        BidResponse response = service.placeBid(makeRequest(3L, 4L, 10_500_000L));

        Assertions.assertFalse(response.isSuccess());
        Assertions.assertEquals("Bạn cần đặt giá cao hơn", response.getMessage());
    }

    @Test
    void canJoinRoom_requiresConfirmedDepositBeforeDeadline() {
        InMemoryAuctionSessionRepository auctionRepo = new InMemoryAuctionSessionRepository();
        BiddingService service = new BiddingService(auctionRepo, new InMemoryBidRepository());
        AuctionSession auction = service.createDefaultAuctionSession(4L, 40L, LocalDateTime.now().plusHours(1));

        Assertions.assertTrue(service.canJoinRoom(auction, true, LocalDateTime.now().minusMinutes(31)));
        Assertions.assertFalse(service.canJoinRoom(auction, false, LocalDateTime.now().minusMinutes(31)));
        Assertions.assertFalse(service.canJoinRoom(auction, true, LocalDateTime.now().plusMinutes(40)));
    }

    private void runBid(BiddingService service, CountDownLatch start, CountDownLatch done, AtomicInteger successCount, Long userId) {
        try {
            start.await();
            BidResponse response = service.placeBid(makeRequest(1L, userId, 11_000_000L));
            if (response.isSuccess()) {
                successCount.incrementAndGet();
            }
        } catch (Exception ignored) {
            // test helper
        } finally {
            done.countDown();
        }
    }

    private BidRequest makeRequest(Long auctionId, Long userId, Long amount) {
        BidRequest request = new BidRequest();
        request.setAuctionId(auctionId);
        request.setUserId(userId);
        request.setBidAmount(amount);
        return request;
    }

    private static class InMemoryAuctionSessionRepository implements AuctionSessionRepository {
        private AuctionSession savedAuction;

        @Override
        public Optional<AuctionSession> findByIdForUpdate(Long auctionId) {
            if (savedAuction != null && savedAuction.getAuctionId().equals(auctionId)) {
                return Optional.of(savedAuction);
            }
            return Optional.empty();
        }

        @Override
        public List<AuctionSession> findOpenRooms() {
            return savedAuction == null ? List.of() : List.of(savedAuction);
        }

        @Override
        public synchronized AuctionSession save(AuctionSession auctionSession) {
            this.savedAuction = auctionSession;
            return auctionSession;
        }
    }

    private static class InMemoryBidRepository implements BidRepository {
        private int savedCount = 0;

        @Override
        public synchronized Bid save(Bid bid) {
            savedCount++;
            return bid;
        }
    }
}
