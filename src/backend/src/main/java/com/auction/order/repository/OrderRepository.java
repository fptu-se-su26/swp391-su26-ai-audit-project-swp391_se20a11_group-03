package com.auction.order.repository;

import com.auction.order.entity.Order;
import com.auction.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByAuction_AuctionId(Long auctionId);
    List<Order> findByBuyer_IdOrSeller_IdOrderByCreatedAtDesc(Integer buyerId, Integer sellerId);
    List<Order> findByShipper_IdOrderByCreatedAtDesc(Integer shipperId);
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatusAndDeliveredAtBefore(OrderStatus status, LocalDateTime before);
    @Lock(LockModeType.PESSIMISTIC_WRITE) Optional<Order> findLockedByOrderId(Long orderId);
}
