package com.auction.order.scheduler;
import com.auction.order.entity.OrderStatus;
import com.auction.order.repository.OrderRepository;
import com.auction.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
@Component @RequiredArgsConstructor
public class OrderAutoCompleteScheduler {
    private final OrderRepository orders; private final OrderService service;
    @Scheduled(cron = "${bidzone.order.auto-complete-cron:0 0 * * * *}")
    public void completeDeliveredOrders() { orders.findByStatusAndDeliveredAtBefore(OrderStatus.DELIVERED, LocalDateTime.now().minusDays(3)).forEach(o -> service.autoComplete(o.getOrderId())); }
}
