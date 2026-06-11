package com.auction.bidding;

import com.auction.bidding.dto.BidRequest;
import com.auction.bidding.dto.BidResponse;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.entity.AuctionStatus;
import com.auction.bidding.entity.Bid;
import com.auction.bidding.repository.AuctionSessionRepository;
import com.auction.bidding.repository.BidRepository;
import com.auction.bidding.service.BiddingService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BiddingServiceTest {

    @Test
    // Test 2 người cùng đặt cùng một mức giá: request vào trước sẽ thắng, request vào sau bị reject.
    void sameBidAmount_firstRequestWins_secondRejected() throws Exception {
        InMemoryAuctionSessionRepository auctionRepo = new InMemoryAuctionSessionRepository();
        BidRepository bidRepo = mockBidRepository();
        BiddingService service = new BiddingService(auctionRepo, bidRepo);

        AuctionSession auction = service.createDefaultAuctionSession(1L, 10L, LocalDateTime.now().minusSeconds(30));
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setCurrentHighestBid(10_000_000L);
        auctionRepo.save(auction);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        runConcurrentBids(service,
                new BidAttempt(1L, 1L, 11_000_000L, 0),
                new BidAttempt(1L, 2L, 11_000_000L, 50),
                successCount,
                failCount);

        Assertions.assertEquals(1, successCount.get());
        Assertions.assertEquals(1, failCount.get());
        verify(bidRepo, times(1)).save(any(Bid.class));
        Assertions.assertEquals(11_000_000L, auctionRepo.savedAuction.getCurrentHighestBid());
        Assertions.assertEquals(Long.valueOf(1L), auctionRepo.savedAuction.getCurrentWinnerUserId());
    }

    @Test
    // Test trường hợp bid cao hơn đến trước: bid thấp hơn đến sau phải bị reject.
    void higherBidFirst_lowerBidRejected() throws Exception {
        InMemoryAuctionSessionRepository auctionRepo = new InMemoryAuctionSessionRepository();
        BidRepository bidRepo = mockBidRepository();
        BiddingService service = new BiddingService(auctionRepo, bidRepo);

        AuctionSession auction = service.createDefaultAuctionSession(2L, 20L, LocalDateTime.now().minusSeconds(30));
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setCurrentHighestBid(10_000_000L);
        auctionRepo.save(auction);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        runConcurrentBids(service,
                new BidAttempt(2L, 3L, 12_000_000L, 0),
                new BidAttempt(2L, 4L, 11_000_000L, 50),
                successCount,
                failCount);

        Assertions.assertEquals(1, successCount.get());
        Assertions.assertEquals(1, failCount.get());
        verify(bidRepo, times(1)).save(any(Bid.class));
        Assertions.assertEquals(12_000_000L, auctionRepo.savedAuction.getCurrentHighestBid());
        Assertions.assertEquals(Long.valueOf(3L), auctionRepo.savedAuction.getCurrentWinnerUserId());
    }

    @Test
    // Test trường hợp bid thấp hơn đến trước nhưng vẫn hợp lệ, sau đó bid cao hơn đến sau vẫn tiếp tục được nhận nếu còn hợp lệ.
    void lowerBidFirst_thenHigherBidStillAccepted_ifMeetsMinimumIncrement() throws Exception {
        InMemoryAuctionSessionRepository auctionRepo = new InMemoryAuctionSessionRepository();
        BidRepository bidRepo = mockBidRepository();
        BiddingService service = new BiddingService(auctionRepo, bidRepo);

        AuctionSession auction = service.createDefaultAuctionSession(3L, 30L, LocalDateTime.now().minusSeconds(30));
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setCurrentHighestBid(10_000_000L);
        auctionRepo.save(auction);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failCount = new AtomicInteger(0);

        runConcurrentBids(service,
                new BidAttempt(3L, 5L, 11_000_000L, 0),
                new BidAttempt(3L, 6L, 12_000_000L, 50),
                successCount,
                failCount);

        Assertions.assertEquals(2, successCount.get());
        Assertions.assertEquals(0, failCount.get());
        verify(bidRepo, times(2)).save(any(Bid.class));
        Assertions.assertEquals(12_000_000L, auctionRepo.savedAuction.getCurrentHighestBid());
        Assertions.assertEquals(Long.valueOf(6L), auctionRepo.savedAuction.getCurrentWinnerUserId());
    }

    @Test
    // Test anti-sniper: bid hợp lệ gần cuối phiên sẽ kéo dài thời gian đấu giá thêm 10 giây.
    void successfulBid_extendsEndTimeBy10Seconds() {
        InMemoryAuctionSessionRepository auctionRepo = new InMemoryAuctionSessionRepository();
        BidRepository bidRepo = mockBidRepository();
        BiddingService service = new BiddingService(auctionRepo, bidRepo);

        LocalDateTime start = LocalDateTime.now().minusSeconds(10);
        AuctionSession auction = service.createDefaultAuctionSession(4L, 40L, start);
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setCurrentHighestBid(5_000_000L);
        LocalDateTime originalEnd = auction.getEndTime();
        auctionRepo.save(auction);

        BidResponse response = service.placeBid(makeRequest(4L, 7L, 6_000_000L));

        Assertions.assertTrue(response.isSuccess());
        Assertions.assertEquals(originalEnd.plusSeconds(10), auctionRepo.savedAuction.getEndTime());
    }

    @Test
    // Test validation bước nhảy: bid thấp hơn mức tối thiểu phải bị reject với đúng message.
    void bidBelowMinimumIncrement_isRejectedWithCorrectMessage() {
        InMemoryAuctionSessionRepository auctionRepo = new InMemoryAuctionSessionRepository();
        BidRepository bidRepo = mockBidRepository();
        BiddingService service = new BiddingService(auctionRepo, bidRepo);

        AuctionSession auction = service.createDefaultAuctionSession(5L, 50L, LocalDateTime.now().minusSeconds(10));
        auction.setStatus(AuctionStatus.ACTIVE);
        auction.setCurrentHighestBid(10_000_000L);
        auctionRepo.save(auction);

        BidResponse response = service.placeBid(makeRequest(5L, 8L, 10_500_000L));

        Assertions.assertFalse(response.isSuccess());
        Assertions.assertEquals("Bạn cần đặt giá cao hơn", response.getMessage());
    }

    @Test
    // Test điều kiện vào phòng: phải có deposit confirmed và trước deadline 30 phút.
    void canJoinRoom_requiresConfirmedDepositBeforeDeadline() {
        InMemoryAuctionSessionRepository auctionRepo = new InMemoryAuctionSessionRepository();
        BiddingService service = new BiddingService(auctionRepo, mockBidRepository());

        LocalDateTime startTime = LocalDateTime.now().plusHours(2);
        AuctionSession auction = service.createDefaultAuctionSession(6L, 60L, startTime);

        LocalDateTime depositTimePass = startTime.minusMinutes(31);
        LocalDateTime depositTimeFail = startTime.minusMinutes(29);
        LocalDateTime depositTimeTooLate = startTime.plusMinutes(40);

        Assertions.assertTrue(service.canJoinRoom(auction, true, depositTimePass));
        Assertions.assertFalse(service.canJoinRoom(auction, true, depositTimeFail));
        Assertions.assertFalse(service.canJoinRoom(auction, false, depositTimePass));
        Assertions.assertFalse(service.canJoinRoom(auction, true, depositTimeTooLate));
    }

    private void runConcurrentBids(BiddingService service, BidAttempt first, BidAttempt second,
                                   AtomicInteger successCount, AtomicInteger failCount) throws Exception {
        CountDownLatch done = new CountDownLatch(2);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        executor.submit(() -> runBid(service, done, successCount, failCount, first));
        executor.submit(() -> runBid(service, done, successCount, failCount, second));
        Assertions.assertTrue(done.await(5, TimeUnit.SECONDS));
        executor.shutdownNow();
    }

    private void runBid(BiddingService service, CountDownLatch done, AtomicInteger successCount, AtomicInteger failCount, BidAttempt attempt) {
        try {
            Thread.sleep(attempt.delayMs);
            BidResponse response = service.placeBid(makeRequest(attempt.auctionId, attempt.userId, attempt.amount));
            if (response.isSuccess()) {
                successCount.incrementAndGet();
            } else {
                failCount.incrementAndGet();
            }
        } catch (Exception ignored) {
            failCount.incrementAndGet();
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

    private BidRepository mockBidRepository() {
        BidRepository bidRepository = mock(BidRepository.class);
        when(bidRepository.save(any(Bid.class))).thenAnswer(invocation -> invocation.getArgument(0));
        return bidRepository;
    }

    private static class BidAttempt {
        private final Long auctionId;
        private final Long userId;
        private final Long amount;
        private final long delayMs;

        private BidAttempt(Long auctionId, Long userId, Long amount, long delayMs) {
            this.auctionId = auctionId;
            this.userId = userId;
            this.amount = amount;
            this.delayMs = delayMs;
        }
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

}
