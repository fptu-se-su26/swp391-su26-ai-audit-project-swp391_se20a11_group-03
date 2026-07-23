package com.auction.order.service;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.bidding.entity.Auction;
import com.auction.event.entity.EventProduct;
import com.auction.product.entity.Product;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.notification.entity.Notification;
import com.auction.notification.service.NotificationService;
import com.auction.order.dto.OrderResponse;
import com.auction.order.dto.ShippingAddressRequest;
import com.auction.order.entity.Order;
import com.auction.order.entity.OrderStatus;
import com.auction.order.entity.OrderStatusHistory;
import com.auction.order.repository.OrderRepository;
import com.auction.order.repository.OrderStatusHistoryRepository;
import com.auction.wallet.entity.Transaction;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {
    public static final double PLATFORM_COMMISSION_RATE = 0.20d;
    private static final Map<OrderStatus, Set<OrderStatus>> EDGES = Map.of(
            OrderStatus.PENDING_PICKUP, Set.of(OrderStatus.ASSIGNED),
            OrderStatus.ASSIGNED, Set.of(OrderStatus.PICKED_UP, OrderStatus.DELIVERY_FAILED),
            OrderStatus.PICKED_UP, Set.of(OrderStatus.IN_TRANSIT, OrderStatus.DELIVERY_FAILED),
            OrderStatus.IN_TRANSIT, Set.of(OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED),
            OrderStatus.DELIVERED, Set.of(OrderStatus.COMPLETED),
            OrderStatus.DELIVERY_FAILED, Set.of(OrderStatus.ASSIGNED, OrderStatus.REFUNDED)
    );

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository historyRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    @Value("${bidzone.shipping.flat-fee:30000}") private long shippingFee;

    public long getShippingFee() { return shippingFee; }

    @Transactional
    public Order createOrder(Auction auction, User buyer, User seller, ShippingAddressRequest address, long finalPrice) {
        orderRepository.findByAuction_AuctionId(auction.getAuctionId()).ifPresent(o -> {
            throw new IllegalStateException("Order already exists for this auction");
        });
        Order order = new Order();
        order.setAuction(auction); order.setBuyer(buyer); order.setSeller(seller); order.setProduct(auction.getProduct());
        order.setFinalPrice(finalPrice); order.setShippingFee(shippingFee);
        order.setReceiverName(address.getReceiverName().trim()); order.setReceiverPhone(address.getReceiverPhone().trim());
        order.setAddressLine(address.getAddressLine().trim()); order.setWard(address.getWard().trim());
        order.setDistrict(address.getDistrict().trim()); order.setProvince(address.getProvince().trim()); order.setNote(address.getNote());
        order.setStatus(OrderStatus.PENDING_PICKUP);
        order = orderRepository.save(order);
        saveHistory(order, null, OrderStatus.PENDING_PICKUP, null, "Order created after payment");
        notify(order.getBuyer(), "Order created", "Your paid order is waiting for pickup.", Notification.NotificationType.ORDER_CREATED, order);
        notify(order.getSeller(), "Order created", "Please prepare the auction item for company pickup.", Notification.NotificationType.ORDER_CREATED, order);
        return order;
    }

    /** Creates a delivery order for a won event product (no main auction). */
    @Transactional
    public Order createEventOrder(EventProduct eventProduct, Product product, User buyer, User seller, ShippingAddressRequest address, long finalPrice) {
        orderRepository.findByEventProductId(eventProduct.getEventProductId()).ifPresent(o -> {
            throw new IllegalStateException("Order already exists for this event product");
        });
        Order order = new Order();
        order.setEventProductId(eventProduct.getEventProductId()); order.setBuyer(buyer); order.setSeller(seller); order.setProduct(product);
        order.setFinalPrice(finalPrice); order.setShippingFee(shippingFee);
        order.setReceiverName(address.getReceiverName().trim()); order.setReceiverPhone(address.getReceiverPhone().trim());
        order.setAddressLine(address.getAddressLine().trim()); order.setWard(address.getWard().trim());
        order.setDistrict(address.getDistrict().trim()); order.setProvince(address.getProvince().trim()); order.setNote(address.getNote());
        order.setStatus(OrderStatus.PENDING_PICKUP);
        order = orderRepository.save(order);
        saveHistory(order, null, OrderStatus.PENDING_PICKUP, null, "Order created after event payment");
        notify(order.getBuyer(), "Order created", "Your paid event order is waiting for pickup.", Notification.NotificationType.ORDER_CREATED, order);
        notify(order.getSeller(), "Order created", "Please prepare the event item for company pickup.", Notification.NotificationType.ORDER_CREATED, order);
        return order;
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(long userId) {
        int id = Math.toIntExact(userId);
        return orderRepository.findByBuyer_IdOrSeller_IdOrderByCreatedAtDesc(id, id).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getMine(long orderId, long userId) {
        Order order = get(orderId);
        if (order.getBuyer().getId() != userId && order.getSeller().getId() != userId) throw new AccessDeniedException("Not your order");
        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> staffOrders(String status) {
        List<Order> orders = status == null || status.isBlank() ? orderRepository.findAllByOrderByCreatedAtDesc()
                : orderRepository.findByStatusOrderByCreatedAtDesc(parseStatus(status));
        return orders.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> shipperOrders(long shipperId) {
        return orderRepository.findByShipper_IdOrderByCreatedAtDesc(Math.toIntExact(shipperId)).stream().map(this::toResponse).toList();
    }

    @Transactional
    public OrderResponse assign(long orderId, long shipperId, long actorId, String note) {
        User actor = user(actorId); requireStaff(actor);
        User shipper = user(shipperId);
        if (!role(shipper, "Shipper")) throw new IllegalArgumentException("Selected user is not a shipper");
        Order order = locked(orderId);
        if (order.getStatus() != OrderStatus.PENDING_PICKUP && order.getStatus() != OrderStatus.DELIVERY_FAILED)
            throw new IllegalStateException("Order cannot be assigned from " + order.getStatus());
        order.setShipper(shipper); order.setAssignedAt(LocalDateTime.now());
        transition(order, OrderStatus.ASSIGNED, actor, note);
        notify(shipper, "Order assigned", "A delivery order has been assigned to you.", Notification.NotificationType.ORDER_ASSIGNED, order);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse shipperTransition(long orderId, String rawStatus, long actorId, String note) {
        User actor = user(actorId); if (!role(actor, "Shipper")) throw new AccessDeniedException("Shipper role required");
        Order order = locked(orderId);
        if (order.getShipper() == null || order.getShipper().getId() != actorId) throw new AccessDeniedException("Order is not assigned to you");
        OrderStatus target = parseStatus(rawStatus);
        if (target == OrderStatus.DELIVERY_FAILED && (note == null || note.isBlank()))
            throw new IllegalArgumentException("A failure reason is required");
        if (!Set.of(OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED, OrderStatus.DELIVERY_FAILED).contains(target))
            throw new AccessDeniedException("Shipper cannot set this status");
        transition(order, target, actor, note);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse confirmReceived(long orderId, long buyerId) {
        User buyer = user(buyerId); Order order = locked(orderId);
        if (order.getBuyer().getId() != buyerId) throw new AccessDeniedException("Only the buyer can confirm receipt");
        transition(order, OrderStatus.COMPLETED, buyer, "Buyer confirmed receipt");
        releasePayout(order);
        return toResponse(order);
    }

    @Transactional
    public OrderResponse refund(long orderId, long actorId, String note) {
        User actor = user(actorId); requireStaff(actor); Order order = locked(orderId);
        if (order.getStatus() != OrderStatus.DELIVERY_FAILED) throw new IllegalStateException("Only failed deliveries can be refunded");
        transition(order, OrderStatus.REFUNDED, actor, note);
        LocalDateTime now = LocalDateTime.now();
        Wallet buyerWallet = wallet(order.getBuyer(), now);
        long refund = order.getFinalPrice() + order.getShippingFee();
        credit(buyerWallet, refund, "ORDER_REFUND", "ORDER-REFUND-" + orderId, "Refund for failed delivery", now);
        User admin = userRepository.findFirstByRole_RoleNameOrderByIdAsc("Admin").orElse(null);
        if (admin != null && order.getShippingFee() > 0) {
            Wallet adminWallet = wallet(admin, now);
            adminWallet.setBalance(Math.max(0L, value(adminWallet.getBalance()) - order.getShippingFee()));
            adminWallet.setUpdatedAt(now);
            walletRepository.save(adminWallet);
            transactionRepository.save(new Transaction(adminWallet, order.getShippingFee(), "SHIPPING_FEE_REFUND", "COMPLETED", "SHIP-REFUND-" + orderId, "Shipping fee refunded", now));
        }
        notify(order.getBuyer(), "Order refunded", "The order price and shipping fee were returned to your wallet.", Notification.NotificationType.ORDER_STATUS_UPDATED, order);
        return toResponse(order);
    }

    @Transactional
    public void autoComplete(long orderId) {
        Order order = locked(orderId);
        if (order.getStatus() != OrderStatus.DELIVERED) return;
        transition(order, OrderStatus.COMPLETED, null, "Automatically completed after 3 days");
        releasePayout(order);
    }

    public void transition(Order order, OrderStatus target, User actor, String note) {
        OrderStatus from = order.getStatus();
        if (!EDGES.getOrDefault(from, Set.of()).contains(target)) throw new IllegalStateException("Invalid order transition: " + from + " -> " + target);
        if (target == OrderStatus.DELIVERED) order.setDeliveredAt(LocalDateTime.now());
        order.setStatus(target); orderRepository.save(order); saveHistory(order, from, target, actor, note);
        Notification.NotificationType type = target == OrderStatus.DELIVERED ? Notification.NotificationType.ORDER_DELIVERED
                : target == OrderStatus.COMPLETED ? Notification.NotificationType.ORDER_COMPLETED
                : target == OrderStatus.DELIVERY_FAILED ? Notification.NotificationType.ORDER_FAILED
                : Notification.NotificationType.ORDER_STATUS_UPDATED;
        notify(order.getBuyer(), "Order " + target, "Your order status changed to " + target + ".", type, order);
        notify(order.getSeller(), "Order " + target, "Order status changed to " + target + ".", type, order);
    }

    public void releasePayout(Order order) {
        if (order.getStatus() != OrderStatus.COMPLETED || order.getPayoutReleasedAt() != null) return;
        LocalDateTime now = LocalDateTime.now(); long price = order.getFinalPrice();
        boolean platform = role(order.getSeller(), "Admin");
        User admin = userRepository.findFirstByRole_RoleNameOrderByIdAsc("Admin").orElse(null);
        if (platform) {
            credit(wallet(order.getSeller(), now), price, "ADMIN_AUCTION_REVENUE", "AUC-ADMIN-REV-" + orderRef(order), "Platform listing revenue", now);
        } else {
            long commission = Math.round(price * PLATFORM_COMMISSION_RATE); long sellerAmount = price - commission;
            credit(wallet(order.getSeller(), now), sellerAmount, "AUCTION_PAYOUT", "AUC-PAYOUT-" + orderRef(order), "Seller payout after completed delivery", now);
            if (admin != null) credit(wallet(admin, now), commission, "PLATFORM_COMMISSION", "AUC-COMMISSION-" + orderRef(order), "Platform commission", now);
        }
        order.setPayoutReleasedAt(now); orderRepository.save(order);
    }

    private void credit(Wallet wallet, long amount, String type, String ref, String description, LocalDateTime now) {
        wallet.setBalance(value(wallet.getBalance()) + amount); wallet.setUpdatedAt(now); walletRepository.save(wallet);
        transactionRepository.save(new Transaction(wallet, amount, type, "COMPLETED", ref, description, now));
    }
    private Wallet wallet(User user, LocalDateTime now) { return walletRepository.findByUserIdForUpdate(user.getId()).orElseGet(() -> { Wallet w = new Wallet(); w.setUser(user); w.setBalance(0L); w.setHoldBalance(0L); w.setUpdatedAt(now); return walletRepository.save(w); }); }
    private long value(Long n) { return n == null ? 0L : n; }
    private String orderRef(Order o) { return o.getAuction() != null ? String.valueOf(o.getAuction().getAuctionId()) : ("EP" + o.getEventProductId()); }
    private Order get(long id) { return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id)); }
    private Order locked(long id) { return orderRepository.findLockedByOrderId(id).orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id)); }
    private User user(long id) { return userRepository.findById(Math.toIntExact(id)).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id)); }
    private boolean role(User u, String r) { return u.getRole() != null && r.equalsIgnoreCase(u.getRole().getRoleName()); }
    private void requireStaff(User u) { if (!role(u, "Staff") && !role(u, "Admin")) throw new AccessDeniedException("Staff role required"); }
    private OrderStatus parseStatus(String s) { try { return OrderStatus.valueOf(s.trim().toUpperCase()); } catch (Exception e) { throw new IllegalArgumentException("Invalid order status: " + s); } }
    private void saveHistory(Order order, OrderStatus from, OrderStatus to, User actor, String note) { OrderStatusHistory h = new OrderStatusHistory(); h.setOrder(order); h.setFromStatus(from); h.setToStatus(to); h.setChangedBy(actor); h.setNote(note); historyRepository.save(h); }
    private void notify(User user, String title, String message, Notification.NotificationType type, Order order) { notificationService.createNotification(user.getUserId(), title, message, type, order.getOrderId(), "ORDER"); }
    private OrderResponse toResponse(Order o) {
        List<OrderResponse.HistoryItem> history = historyRepository.findByOrder_OrderIdOrderByCreatedAtAsc(o.getOrderId()).stream().map(h -> OrderResponse.HistoryItem.builder().fromStatus(h.getFromStatus() == null ? null : h.getFromStatus().name()).toStatus(h.getToStatus().name()).changedBy(h.getChangedBy() == null ? "SYSTEM" : h.getChangedBy().getUsername()).note(h.getNote()).createdAt(h.getCreatedAt()).build()).toList();
        return OrderResponse.builder().orderId(o.getOrderId()).auctionId(o.getAuction() == null ? null : o.getAuction().getAuctionId()).productId(o.getProduct().getProductId()).productName(o.getProduct().getProductName()).buyerId(o.getBuyer().getUserId()).sellerId(o.getSeller().getUserId()).shipperId(o.getShipper() == null ? null : o.getShipper().getUserId()).buyerName(o.getBuyer().getUsername()).sellerName(o.getSeller().getUsername()).shipperName(o.getShipper() == null ? null : o.getShipper().getUsername()).finalPrice(o.getFinalPrice()).shippingFee(o.getShippingFee()).receiverName(o.getReceiverName()).receiverPhone(o.getReceiverPhone()).addressLine(o.getAddressLine()).ward(o.getWard()).district(o.getDistrict()).province(o.getProvince()).note(o.getNote()).status(o.getStatus().name()).assignedAt(o.getAssignedAt()).deliveredAt(o.getDeliveredAt()).payoutReleasedAt(o.getPayoutReleasedAt()).createdAt(o.getCreatedAt()).updatedAt(o.getUpdatedAt()).history(history).build();
    }
}
