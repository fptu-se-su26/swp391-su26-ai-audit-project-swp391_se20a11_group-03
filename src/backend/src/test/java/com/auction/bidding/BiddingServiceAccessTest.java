package com.auction.bidding;

import com.auction.bidding.dto.BidRequest;
import com.auction.bidding.dto.BidResponse;
import com.auction.bidding.entity.AuctionSession;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.bidding.repository.AuctionRepository;
import com.auction.bidding.repository.BidRepository;
import com.auction.bidding.service.BiddingService;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductImageRepository;
import com.auction.product.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BiddingServiceAccessTest {

    private final com.auction.bidding.repository.AuctionSessionRepository sessionRepository =
            mock(com.auction.bidding.repository.AuctionSessionRepository.class);
    private final AuctionRepository auctionRepository = mock(AuctionRepository.class);
    private final BidRepository bidRepository = mock(BidRepository.class);
    private final ProductRepository productRepository = mock(ProductRepository.class);
    private final ProductImageRepository imageRepository = mock(ProductImageRepository.class);
    private final AuctionDepositRepository depositRepository = mock(AuctionDepositRepository.class);
    private final com.auction.wallet.repository.WalletRepository walletRepository =
            mock(com.auction.wallet.repository.WalletRepository.class);
    private final com.auction.wallet.repository.TransactionRepository transactionRepository =
            mock(com.auction.wallet.repository.TransactionRepository.class);
    private final com.auction.account.dao.UserRepository userRepository =
            mock(com.auction.account.dao.UserRepository.class);

    private BiddingService service;

    @BeforeEach
    void setUp() {
        service = new BiddingService(
                sessionRepository,
                auctionRepository,
                bidRepository,
                productRepository,
                imageRepository,
                depositRepository,
                walletRepository,
                transactionRepository,
                userRepository);
    }

    @Test
    void sellerCannotBidOnOwnProduct() {
        AuctionSession session = session(7L, 70L);
        Product product = product(70L, 42L);
        when(sessionRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(session));
        when(productRepository.findById(70L)).thenReturn(Optional.of(product));

        BidResponse response = service.placeBid(request(7L, 42L, 10_500_000L));

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("không thể tự đặt giá"));
        verify(bidRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void bidderWithoutDepositCannotBid() {
        // Deposits gate LIVE rooms only — TIMED is open (real-money) bidding.
        AuctionSession session = session(7L, 70L);
        session.setAuctionMode(com.auction.bidding.entity.AuctionMode.LIVE);
        Product product = product(70L, 42L);
        when(sessionRepository.findByIdForUpdate(7L)).thenReturn(Optional.of(session));
        when(productRepository.findById(70L)).thenReturn(Optional.of(product));
        when(depositRepository.findByAuction_AuctionIdAndUser_Id(7L, 99))
                .thenReturn(Optional.empty());

        BidResponse response = service.placeBid(request(7L, 99L, 10_500_000L));

        assertFalse(response.isSuccess());
        assertTrue(response.getMessage().contains("phải đặt cọc"));
        verify(bidRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    private static AuctionSession session(Long auctionId, Long productId) {
        AuctionSession session = new AuctionSession();
        session.setAuctionId(auctionId);
        session.setProductId(productId);
        return session;
    }

    private static Product product(Long productId, Long sellerId) {
        Product product = new Product();
        product.setProductId(productId);
        product.setSellerId(sellerId);
        product.setStartingPrice(10_000_000L);
        return product;
    }

    private static BidRequest request(Long auctionId, Long userId, Long amount) {
        BidRequest request = new BidRequest();
        request.setAuctionId(auctionId);
        request.setUserId(userId);
        request.setBidAmount(amount);
        return request;
    }
}
