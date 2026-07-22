package com.auction.order;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.bidding.entity.Auction;
import com.auction.notification.service.NotificationService;
import com.auction.order.entity.Order;
import com.auction.order.entity.OrderStatus;
import com.auction.order.repository.OrderRepository;
import com.auction.order.repository.OrderStatusHistoryRepository;
import com.auction.order.service.OrderService;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;

class OrderServiceTest {

    private OrderRepository orderRepository;
    private OrderStatusHistoryRepository historyRepository;
    private UserRepository userRepository;
    private WalletRepository walletRepository;
    private TransactionRepository transactionRepository;
    private NotificationService notificationService;
    private OrderService service;

    private User buyer;
    private User seller;
    private Order order;

    @BeforeEach
    void setUp() {
        orderRepository = mock(OrderRepository.class);
        historyRepository = mock(OrderStatusHistoryRepository.class);
        userRepository = mock(UserRepository.class);
        walletRepository = mock(WalletRepository.class);
        transactionRepository = mock(TransactionRepository.class);
        notificationService = mock(NotificationService.class);
        service = new OrderService(orderRepository, historyRepository, userRepository,
                walletRepository, transactionRepository, notificationService);

        buyer = mock(User.class);
        when(buyer.getUserId()).thenReturn(1L);
        seller = mock(User.class);
        when(seller.getUserId()).thenReturn(2L);
        when(seller.getId()).thenReturn(2);

        Auction auction = mock(Auction.class);
        when(auction.getAuctionId()).thenReturn(10L);

        order = new Order();
        order.setBuyer(buyer);
        order.setSeller(seller);
        order.setAuction(auction);
        order.setFinalPrice(1_000_000L);
        order.setShippingFee(30_000L);
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void forwardTransitions_followTheDeliveryFlow() {
        order.setStatus(OrderStatus.PENDING_PICKUP);
        service.transition(order, OrderStatus.ASSIGNED, null, null);
        service.transition(order, OrderStatus.PICKED_UP, null, null);
        service.transition(order, OrderStatus.IN_TRANSIT, null, null);
        service.transition(order, OrderStatus.DELIVERED, null, null);
        assertNotNull(order.getDeliveredAt());
        service.transition(order, OrderStatus.COMPLETED, null, null);
        assertEquals(OrderStatus.COMPLETED, order.getStatus());
    }

    @Test
    void skippingAStep_isRejected() {
        order.setStatus(OrderStatus.ASSIGNED);
        assertThrows(IllegalStateException.class,
                () -> service.transition(order, OrderStatus.DELIVERED, null, null));
        assertEquals(OrderStatus.ASSIGNED, order.getStatus());
    }

    @Test
    void backwardTransition_isRejected() {
        order.setStatus(OrderStatus.IN_TRANSIT);
        assertThrows(IllegalStateException.class,
                () -> service.transition(order, OrderStatus.PICKED_UP, null, null));
    }

    @Test
    void deliveryFailed_isAllowedFromAssignedPickedUpAndInTransit() {
        for (OrderStatus from : new OrderStatus[]{OrderStatus.ASSIGNED, OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT}) {
            order.setStatus(from);
            service.transition(order, OrderStatus.DELIVERY_FAILED, null, "reason");
            assertEquals(OrderStatus.DELIVERY_FAILED, order.getStatus());
        }
    }

    @Test
    void completedOrder_isTerminal() {
        order.setStatus(OrderStatus.COMPLETED);
        assertThrows(IllegalStateException.class,
                () -> service.transition(order, OrderStatus.DELIVERED, null, null));
    }

    @Test
    void releasePayout_splits80_20_andIsIdempotent() {
        order.setStatus(OrderStatus.COMPLETED);

        User admin = mock(User.class);
        when(admin.getId()).thenReturn(99);
        when(userRepository.findFirstByRole_RoleNameOrderByIdAsc("Admin")).thenReturn(Optional.of(admin));

        Wallet sellerWallet = new Wallet();
        sellerWallet.setBalance(0L);
        Wallet adminWallet = new Wallet();
        adminWallet.setBalance(0L);
        when(walletRepository.findLockedByUser_Id(2)).thenReturn(Optional.of(sellerWallet));
        when(walletRepository.findLockedByUser_Id(99)).thenReturn(Optional.of(adminWallet));

        service.releasePayout(order);
        assertEquals(800_000L, sellerWallet.getBalance());
        assertEquals(200_000L, adminWallet.getBalance());
        assertNotNull(order.getPayoutReleasedAt());

        // Second call must not pay twice.
        service.releasePayout(order);
        assertEquals(800_000L, sellerWallet.getBalance());
        assertEquals(200_000L, adminWallet.getBalance());
    }

    @Test
    void releasePayout_beforeCompletion_doesNothing() {
        order.setStatus(OrderStatus.DELIVERED);
        service.releasePayout(order);
        assertNull(order.getPayoutReleasedAt());
        verify(walletRepository, never()).findLockedByUser_Id(anyInt());
    }
}
