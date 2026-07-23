package com.auction.event;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.account.service.UserPaymentStrikeService;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.entity.EventRegistration;
import com.auction.event.enums.EventMoneyMode;
import com.auction.event.enums.EventStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.service.impl.EventPaymentServiceImpl;
import com.auction.order.dto.ShippingAddressRequest;
import com.auction.order.service.OrderService;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventPaymentServiceImplTest {

    private static final long EVENT_ID = 10L;
    private static final long EVENT_PRODUCT_ID = 20L;
    private static final long BUYER_ID = 1L;

    @Mock EventProductRepository eventProductRepository;
    @Mock AuctionEventRepository eventRepository;
    @Mock EventRegistrationRepository registrationRepository;
    @Mock ProductRepository productRepository;
    @Mock UserRepository userRepository;
    @Mock WalletRepository walletRepository;
    @Mock TransactionRepository transactionRepository;
    @Mock OrderService orderService;
    @Mock UserPaymentStrikeService userPaymentStrikeService;

    @InjectMocks EventPaymentServiceImpl paymentService;

    private EventProduct wonProduct;
    private EventRegistration registration;
    private Wallet buyerWallet;
    private AuctionEvent event;
    private User buyer;
    private User seller;

    @BeforeEach
    void setUp() {
        wonProduct = new EventProduct();
        wonProduct.setEventProductId(EVENT_PRODUCT_ID);
        wonProduct.setEventId(EVENT_ID);
        wonProduct.setProductId(30L);
        wonProduct.setSubmittedBySellerId(2L);
        wonProduct.setWinnerId(BUYER_ID);
        wonProduct.setFinalPrice(100L);
        wonProduct.setHeldAmount(0L);
        wonProduct.setPaymentStatus("AWAITING_PAYMENT");
        wonProduct.setPaymentDeadline(LocalDateTime.now().plusHours(1));

        registration = new EventRegistration();
        registration.setEventId(EVENT_ID);
        registration.setUserId(BUYER_ID);
        registration.setDepositAmount(50L);
        registration.setDepositStatus("HELD");

        buyer = new User();
        buyer.setId(Math.toIntExact(BUYER_ID));
        seller = new User();
        seller.setId(2);

        buyerWallet = new Wallet();
        buyerWallet.setUser(buyer);
        buyerWallet.setBalance(1_000L);
        buyerWallet.setHoldBalance(50L);

        event = new AuctionEvent();
        event.setEventId(EVENT_ID);
        event.setMoneyMode(EventMoneyMode.VIRTUAL);
        event.setStatus(EventStatus.ENDED);
    }

    @Test
    void payLastVirtualEventWin_refundsRegistrationDepositAfterEventEnded() {
        successfulPaymentStubs(event, buyer, seller);
        when(eventProductRepository.findByEventId(EVENT_ID)).thenReturn(List.of(wonProduct));

        paymentService.payEventProduct(EVENT_PRODUCT_ID, BUYER_ID, new ShippingAddressRequest());

        assertEquals("PAID", wonProduct.getPaymentStatus());
        assertEquals("REFUNDED", registration.getDepositStatus());
        assertEquals(900L, buyerWallet.getBalance());
        assertEquals(0L, buyerWallet.getHoldBalance());
        verify(registrationRepository).save(registration);
        verify(userPaymentStrikeService).recordSuccessfulPayment(any(User.class), eq(EVENT_PRODUCT_ID));
    }

    @Test
    void payOneOfSeveralVirtualEventWins_keepsDepositUntilAllWinsAreSettled() {
        successfulPaymentStubs(event, buyer, seller);
        EventProduct otherPendingWin = new EventProduct();
        otherPendingWin.setWinnerId(BUYER_ID);
        otherPendingWin.setPaymentStatus("AWAITING_PAYMENT");
        when(eventProductRepository.findByEventId(EVENT_ID)).thenReturn(List.of(wonProduct, otherPendingWin));

        paymentService.payEventProduct(EVENT_PRODUCT_ID, BUYER_ID, new ShippingAddressRequest());

        assertEquals("PAID", wonProduct.getPaymentStatus());
        assertEquals("HELD", registration.getDepositStatus());
        assertEquals(50L, buyerWallet.getHoldBalance());
        verify(registrationRepository, never()).save(registration);
    }

    @Test
    void forfeitOverduePayments_rechecksLockedRowBeforeChangingMoney() {
        EventProduct staleCandidate = new EventProduct();
        staleCandidate.setEventProductId(99L);
        staleCandidate.setPaymentStatus("AWAITING_PAYMENT");
        staleCandidate.setPaymentDeadline(LocalDateTime.now().minusMinutes(1));

        EventProduct paidLockedRow = new EventProduct();
        paidLockedRow.setEventProductId(99L);
        paidLockedRow.setPaymentStatus("PAID");

        when(eventProductRepository.findByPaymentStatusIgnoreCaseAndPaymentDeadlineLessThanEqual(
                any(String.class), any(LocalDateTime.class))).thenReturn(List.of(staleCandidate));
        when(eventProductRepository.findLockedById(99L)).thenReturn(Optional.of(paidLockedRow));

        assertEquals(0, paymentService.forfeitOverdueEventPayments());

        verify(walletRepository, never()).save(any(Wallet.class));
        verify(eventProductRepository, never()).save(paidLockedRow);
    }

    private void successfulPaymentStubs(AuctionEvent event, User buyer, User seller) {
        when(eventProductRepository.findLockedById(EVENT_PRODUCT_ID)).thenReturn(Optional.of(wonProduct));
        when(eventRepository.findById(EVENT_ID)).thenReturn(Optional.of(event));
        when(orderService.getShippingFee()).thenReturn(0L);
        when(walletRepository.findByUserIdForUpdate(1)).thenReturn(Optional.of(buyerWallet));
        when(productRepository.findById(30L)).thenReturn(Optional.of(new Product()));
        when(userRepository.findById(1)).thenReturn(Optional.of(buyer));
        when(userRepository.findById(2)).thenReturn(Optional.of(seller));
        when(registrationRepository.findLockedByEventIdAndUserId(EVENT_ID, BUYER_ID))
                .thenReturn(Optional.of(registration));
    }
}
