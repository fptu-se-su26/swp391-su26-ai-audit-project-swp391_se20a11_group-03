package com.auction.event.service.impl;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.account.service.UserPaymentStrikeService;
import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventProduct;
import com.auction.event.entity.EventRegistration;
import com.auction.event.enums.EventMoneyMode;
import com.auction.event.enums.EventProductSessionStatus;
import com.auction.event.enums.EventStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventProductRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.service.EventPaymentService;
import com.auction.order.dto.ShippingAddressRequest;
import com.auction.order.service.OrderService;
import com.auction.product.entity.Product;
import com.auction.product.repository.ProductRepository;
import com.auction.wallet.entity.Transaction;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Post-win money flow for event auctions: the winner pays real money to receive
 * the goods (creating a delivery order + escrow, exactly like a main auction),
 * overdue winners forfeit their stake, and non-winning bidders get their
 * registration deposit (VIRTUAL) or bid hold (REAL) back.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EventPaymentServiceImpl implements EventPaymentService {

    /** How long the event winner has to pay after the product session ends. */
    public static final long PAYMENT_WINDOW_HOURS = 72L;

    private final EventProductRepository eventProductRepository;
    private final AuctionEventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final OrderService orderService;
    private final UserPaymentStrikeService userPaymentStrikeService;

    /** Marks a just-sold product as awaiting the winner's real-money payment. */
    public void markAwaitingPayment(EventProduct product, LocalDateTime now) {
        product.setPaymentStatus("AWAITING_PAYMENT");
        product.setPaymentDeadline(now.plusHours(PAYMENT_WINDOW_HOURS));
    }

    @Override
    @Transactional
    public void payEventProduct(Long eventProductId, Long userId, ShippingAddressRequest address) {
        EventProduct product = eventProductRepository.findLockedById(eventProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm sự kiện"));

        if (product.getWinnerId() == null || !product.getWinnerId().equals(userId)) {
            throw new BusinessException("Chỉ người thắng mới có thể thanh toán sản phẩm này");
        }
        if (!"AWAITING_PAYMENT".equalsIgnoreCase(product.getPaymentStatus())) {
            throw new BusinessException("Sản phẩm không ở trạng thái chờ thanh toán");
        }
        LocalDateTime now = LocalDateTime.now();
        if (product.getPaymentDeadline() != null && now.isAfter(product.getPaymentDeadline())) {
            throw new BusinessException("Đã quá hạn thanh toán");
        }
        if (product.getProductId() == null) {
            throw new BusinessException("Sản phẩm sự kiện không gắn với sản phẩm thật để giao hàng");
        }

        AuctionEvent event = eventRepository.findById(product.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sự kiện"));
        boolean virtual = event.getMoneyMode() == EventMoneyMode.VIRTUAL;

        long finalPrice = product.getFinalPrice() != null ? product.getFinalPrice() : 0L;
        long shippingFee = orderService.getShippingFee();
        long totalCharge = finalPrice + shippingFee;

        Wallet buyerWallet = walletRepository.findByUserIdForUpdate(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví người thắng"));
        long balance = buyerWallet.getBalance() == null ? 0L : buyerWallet.getBalance();
        long hold = buyerWallet.getHoldBalance() == null ? 0L : buyerWallet.getHoldBalance();

        // The stake released as part of THIS payment. REAL → the winning bid hold.
        // VIRTUAL → 0: the registration deposit stays held until the event ends so a
        // bidder who wins multiple products can't dodge forfeit by paying only one
        // (it is refunded in refundRemainingDeposits, or consumed by forfeitOne).
        long bidHeld = product.getHeldAmount() != null ? product.getHeldAmount() : 0L;
        long releasableHold = virtual ? 0L : bidHeld;

        long otherHolds = Math.max(0L, hold - releasableHold);
        long availableForPayment = balance - otherHolds;
        if (availableForPayment < totalCharge) {
            throw new BusinessException("Số dư ví không đủ để thanh toán (" + String.format("%,d", totalCharge) + " VND)");
        }

        buyerWallet.setBalance(balance - totalCharge);
        buyerWallet.setHoldBalance(Math.max(0L, hold - releasableHold));
        buyerWallet.setUpdatedAt(now);
        walletRepository.save(buyerWallet);

        record(buyerWallet, finalPrice, "EVENT_PAYMENT", "EVENT-PAY-" + eventProductId,
                "Thanh toán sản phẩm sự kiện " + eventProductId, now);

        // Shipping fee is platform revenue (credited now); the item price stays in
        // escrow until delivery, then OrderService.releasePayout pays the seller.
        if (shippingFee > 0) {
            record(buyerWallet, shippingFee, "SHIPPING_FEE", "EVENT-SHIP-" + eventProductId,
                    "Phí giao hàng sản phẩm sự kiện " + eventProductId, now);
            Wallet admin = getAdminWallet(now);
            if (admin != null) {
                admin.setBalance((admin.getBalance() == null ? 0L : admin.getBalance()) + shippingFee);
                admin.setUpdatedAt(now);
                walletRepository.save(admin);
                record(admin, shippingFee, "SHIPPING_FEE_REVENUE", "EVENT-SHIP-REV-" + eventProductId,
                        "Phí giao hàng sản phẩm sự kiện " + eventProductId, now);
            }
        }

        Product realProduct = productRepository.findById(product.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm để tạo đơn"));
        User buyer = userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người mua"));
        User seller = userRepository.findById(Math.toIntExact(product.getSubmittedBySellerId()))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người bán"));
        orderService.createEventOrder(product, realProduct, buyer, seller, address, finalPrice);

        product.setPaymentStatus("PAID");
        product.setHeldAmount(0L);
        product.setSettledAt(now);
        eventProductRepository.save(product);

        // At event end the lifecycle job keeps a winner's deposit while any won
        // product is awaiting payment. Once the last one is paid, release that
        // deposit here because the event-end transition will not run a second time.
        if (virtual && event.getStatus() == EventStatus.ENDED) {
            refundRegistrationDepositIfSettled(product.getEventId(), userId, now);
        }

        userRepository.findById(Math.toIntExact(userId))
                .ifPresent(u -> userPaymentStrikeService.recordSuccessfulPayment(u, eventProductId));
    }

    @Override
    @Transactional
    public int forfeitOverdueEventPayments() {
        LocalDateTime now = LocalDateTime.now();
        int count = 0;
        List<EventProduct> candidates = eventProductRepository
                .findByPaymentStatusIgnoreCaseAndPaymentDeadlineLessThanEqual("AWAITING_PAYMENT", now);
        for (EventProduct candidate : candidates) {
            EventProduct product = eventProductRepository.findLockedById(candidate.getEventProductId()).orElse(null);
            if (product == null) {
                continue;
            }
            if (!"AWAITING_PAYMENT".equalsIgnoreCase(product.getPaymentStatus())) {
                continue;
            }
            if (product.getPaymentDeadline() == null || now.isBefore(product.getPaymentDeadline())) {
                continue;
            }
            if (product.getWinnerId() == null) {
                continue;
            }
            try {
                forfeitOne(product, now);
                count++;
            } catch (Exception ex) {
                log.warn("Failed to forfeit overdue event product {}: {}", product.getEventProductId(), ex.getMessage());
            }
        }
        return count;
    }

    private void forfeitOne(EventProduct product, LocalDateTime now) {
        AuctionEvent event = eventRepository.findById(product.getEventId()).orElse(null);
        boolean virtual = event != null && event.getMoneyMode() == EventMoneyMode.VIRTUAL;
        Long winnerId = product.getWinnerId();
        EventRegistration registrationToForfeit = null;

        long forfeitAmount;
        if (virtual) {
            registrationToForfeit = registrationRepository
                    .findLockedByEventIdAndUserId(product.getEventId(), winnerId)
                    .orElse(null);
            forfeitAmount = (registrationToForfeit != null
                    && "HELD".equalsIgnoreCase(registrationToForfeit.getDepositStatus())
                    && registrationToForfeit.getDepositAmount() != null)
                    ? registrationToForfeit.getDepositAmount() : 0L;
        } else {
            forfeitAmount = product.getHeldAmount() != null ? product.getHeldAmount() : 0L;
        }

        // Move the forfeited stake from the winner's hold to the admin wallet.
        if (forfeitAmount > 0) {
            Wallet winnerWallet = walletRepository.findByUserIdForUpdate(Math.toIntExact(winnerId))
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví người thắng để tịch thu cọc"));
            long balance = winnerWallet.getBalance() == null ? 0L : winnerWallet.getBalance();
            long hold = winnerWallet.getHoldBalance() == null ? 0L : winnerWallet.getHoldBalance();
            if (hold < forfeitAmount || balance < forfeitAmount) {
                throw new IllegalStateException("Số dư/cọc giữ không khớp với khoản cần tịch thu");
            }
            Wallet admin = getAdminWallet(now);
            if (admin == null) {
                throw new IllegalStateException("Không tìm thấy ví quản trị để nhận khoản tịch thu");
            }
            winnerWallet.setHoldBalance(hold - forfeitAmount);
            winnerWallet.setBalance(balance - forfeitAmount);
            winnerWallet.setUpdatedAt(now);
            walletRepository.save(winnerWallet);
            admin.setBalance((admin.getBalance() == null ? 0L : admin.getBalance()) + forfeitAmount);
            admin.setUpdatedAt(now);
            walletRepository.save(admin);
            record(admin, forfeitAmount, "FORFEIT_EVENT_DEPOSIT", "EVENT-FORFEIT-" + product.getEventProductId(),
                    "Tịch thu cọc/tiền đặt do người thắng không thanh toán event product " + product.getEventProductId(), now);
        }

        if (registrationToForfeit != null && forfeitAmount > 0) {
            registrationToForfeit.setDepositStatus("FORFEITED");
            registrationRepository.save(registrationToForfeit);
        }

        product.setPaymentStatus("FORFEITED");
        product.setSessionStatus(EventProductSessionStatus.ENDED_UNSOLD);
        product.setHeldAmount(0L);
        product.setSettledAt(now);
        eventProductRepository.save(product);

        userRepository.findById(Math.toIntExact(winnerId))
                .ifPresent(u -> userPaymentStrikeService.recordForfeit(u, product.getEventProductId()));
    }

    /** Refund any still-held registration deposits for a finished event (non-winners). */
    @Override
    @Transactional
    public void refundRemainingDeposits(Long eventId) {
        LocalDateTime now = LocalDateTime.now();
        List<EventRegistration> candidates = registrationRepository.findByEventId(eventId);
        for (EventRegistration candidate : candidates) {
            EventRegistration reg = registrationRepository
                    .findLockedByEventIdAndUserId(eventId, candidate.getUserId())
                    .orElse(null);
            if (reg == null) {
                continue;
            }
            if (!"HELD".equalsIgnoreCase(reg.getDepositStatus())) {
                continue;
            }
            // Keep the deposit held for a winner who is still within their payment window.
            boolean hasPendingWin = eventProductRepository.findByEventId(eventId).stream()
                    .anyMatch(p -> reg.getUserId().equals(p.getWinnerId())
                            && "AWAITING_PAYMENT".equalsIgnoreCase(p.getPaymentStatus()));
            if (hasPendingWin) {
                continue;
            }
            releaseRegistrationDeposit(reg, now,
                    "EVENT-DEPOSIT-REFUND-END-" + eventId + "-" + reg.getUserId(),
                    "Hoàn cọc khi sự kiện " + eventId + " kết thúc");
        }
    }

    private void refundRegistrationDepositIfSettled(Long eventId, Long userId, LocalDateTime now) {
        EventRegistration registration = registrationRepository
                .findLockedByEventIdAndUserId(eventId, userId)
                .orElse(null);
        if (registration == null || !"HELD".equalsIgnoreCase(registration.getDepositStatus())) {
            return;
        }
        boolean hasPendingWin = eventProductRepository.findByEventId(eventId).stream()
                .anyMatch(p -> userId.equals(p.getWinnerId())
                        && "AWAITING_PAYMENT".equalsIgnoreCase(p.getPaymentStatus()));
        if (!hasPendingWin) {
            releaseRegistrationDeposit(registration, now,
                    "EVENT-DEPOSIT-REFUND-SETTLED-" + eventId + "-" + userId,
                    "Hoàn cọc sau khi đã thanh toán toàn bộ sản phẩm thắng trong sự kiện " + eventId);
        }
    }

    private void releaseRegistrationDeposit(
            EventRegistration registration,
            LocalDateTime now,
            String referenceCode,
            String description
    ) {
        long deposit = registration.getDepositAmount() != null ? registration.getDepositAmount() : 0L;
        if (deposit > 0) {
            Wallet wallet = walletRepository.findByUserIdForUpdate(Math.toIntExact(registration.getUserId()))
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ví để hoàn cọc sự kiện"));
            long hold = wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance();
            if (hold < deposit) {
                throw new IllegalStateException("Số dư đang giữ nhỏ hơn khoản cọc cần hoàn");
            }
            wallet.setHoldBalance(hold - deposit);
            wallet.setUpdatedAt(now);
            walletRepository.save(wallet);
            record(wallet, deposit, "REFUND_EVENT_DEPOSIT", referenceCode, description, now);
        }
        registration.setDepositStatus("REFUNDED");
        registrationRepository.save(registration);
    }

    private Wallet getAdminWallet(LocalDateTime now) {
        User admin = userRepository.findFirstByRole_RoleNameOrderByIdAsc("Admin").orElse(null);
        if (admin == null) {
            return null;
        }
        return walletRepository.findByUserIdForUpdate(admin.getId()).orElseGet(() -> {
            Wallet w = new Wallet();
            w.setUser(admin);
            w.setBalance(0L);
            w.setHoldBalance(0L);
            w.setUpdatedAt(now);
            return walletRepository.save(w);
        });
    }

    private void record(Wallet wallet, long amount, String type, String ref, String desc, LocalDateTime now) {
        Transaction tx = new Transaction();
        tx.setWallet(wallet);
        tx.setAmount(amount);
        tx.setTransactionType(type);
        tx.setStatus("COMPLETED");
        tx.setReferenceCode(ref);
        tx.setDescription(desc);
        tx.setCreatedAt(now);
        transactionRepository.save(tx);
    }
}
