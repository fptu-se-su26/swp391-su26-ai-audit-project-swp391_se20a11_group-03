package com.auction.order;

import com.auction.account.dao.UserRepository;
import com.auction.notification.service.NotificationService;
import com.auction.order.entity.Order;
import com.auction.order.entity.OrderStatus;
import com.auction.order.repository.OrderRepository;
import com.auction.order.repository.OrderStatusHistoryRepository;
import com.auction.order.service.OrderService;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OrderServiceStateMachineTest {
    private OrderRepository orders;
    private OrderStatusHistoryRepository history;
    private NotificationService notifications;
    private OrderService service;

    @BeforeEach
    void setUp() {
        orders = mock(OrderRepository.class);
        history = mock(OrderStatusHistoryRepository.class);
        notifications = mock(NotificationService.class);
        service = new OrderService(orders, history, mock(UserRepository.class), mock(WalletRepository.class),
                mock(TransactionRepository.class), notifications);
    }

    @Test
    void validTransitionAdvancesOneStepAndWritesHistory() {
        Order order = mockOrder(OrderStatus.ASSIGNED);
        service.transition(order, OrderStatus.PICKED_UP, null, "Picked up");
        assertEquals(OrderStatus.PICKED_UP, order.getStatus());
        verify(orders).save(order);
        verify(history).save(any());
        verify(notifications, times(2)).createNotification(any(), any(), any(), any(), any(), any());
    }

    @Test
    void cannotSkipAState() {
        Order order = mockOrder(OrderStatus.ASSIGNED);
        assertThrows(IllegalStateException.class,
                () -> service.transition(order, OrderStatus.IN_TRANSIT, null, "skip"));
        verifyNoInteractions(history, notifications);
        verify(orders, never()).save(any());
    }

    @Test
    void completedAndRefundedAreTerminal() {
        assertThrows(IllegalStateException.class,
                () -> service.transition(mockOrder(OrderStatus.COMPLETED), OrderStatus.DELIVERED, null, null));
        assertThrows(IllegalStateException.class,
                () -> service.transition(mockOrder(OrderStatus.REFUNDED), OrderStatus.ASSIGNED, null, null));
    }

    private Order mockOrder(OrderStatus status) {
        var buyer = new com.auction.account.entity.User(); buyer.setId(1);
        var seller = new com.auction.account.entity.User(); seller.setId(2);
        Order order = new Order(); order.setOrderId(9L); order.setStatus(status); order.setBuyer(buyer); order.setSeller(seller);
        return order;
    }
}
