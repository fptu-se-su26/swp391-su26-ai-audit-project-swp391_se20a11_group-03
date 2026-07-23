package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.event.dto.EventResponse;
import com.auction.event.entity.AuctionEvent;
import com.auction.event.entity.EventRegistration;
import com.auction.event.enums.EventMoneyMode;
import com.auction.event.enums.EventRegistrationRole;
import com.auction.event.enums.EventRegistrationStatus;
import com.auction.event.enums.EventStatus;
import com.auction.event.repository.AuctionEventRepository;
import com.auction.event.repository.EventRegistrationRepository;
import com.auction.event.service.EventUserRegistrationService;
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
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EventUserRegistrationServiceImpl implements EventUserRegistrationService {

    private final AuctionEventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional
    public EventResponse registerAsBidder(Long eventId, Long userId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStatus() != EventStatus.PUBLISHED && event.getStatus() != EventStatus.ONGOING) {
            throw new BusinessException("Không thể đăng ký sự kiện này");
        }

        if (event.getRegistrationOpenAt() != null && LocalDateTime.now().isBefore(event.getRegistrationOpenAt())) {
            throw new BusinessException("Chưa đến thời gian mở đăng ký");
        }

        if (event.getRegistrationDeadline() != null && LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new BusinessException("Đã hết thời hạn đăng ký");
        }

        // Reuse a prior CANCELLED registration so a user can re-register after
        // unregistering (the unique (EventId,UserId) constraint forbids a 2nd row).
        EventRegistration registration = registrationRepository.findByEventIdAndUserId(eventId, userId).orElse(null);
        if (registration != null && registration.getStatus() == EventRegistrationStatus.REGISTERED) {
            throw new BusinessException("Bạn đã đăng ký sự kiện này rồi");
        }

        LocalDateTime now = LocalDateTime.now();
        if (registration == null) {
            registration = new EventRegistration();
            registration.setEventId(eventId);
            registration.setUserId(userId);
        }
        registration.setRole(EventRegistrationRole.BIDDER);
        registration.setStatus(EventRegistrationStatus.REGISTERED);
        registration.setRegisteredAt(now);
        registration.setNotifyOnOpen(true);

        // VIRTUAL-money events: stake a real deposit up front. Bids are then free
        // "play money", but the deposit is forfeited if the winner never pays.
        if (event.getMoneyMode() == EventMoneyMode.VIRTUAL) {
            long deposit = event.getDepositAmount() != null ? event.getDepositAmount() : 0L;
            if (deposit <= 0) {
                throw new BusinessException("Sự kiện chưa cấu hình mức cọc hợp lệ");
            }
            Wallet wallet = walletRepository.findByUserIdForUpdate(Math.toIntExact(userId))
                    .orElseThrow(() -> new BusinessException("Số dư ví không đủ để đặt cọc tham gia sự kiện"));
            long balance = wallet.getBalance() == null ? 0L : wallet.getBalance();
            long hold = wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance();
            if (balance - hold < deposit) {
                throw new BusinessException("Số dư ví khả dụng không đủ để đặt cọc " + String.format("%,d", deposit) + " VND");
            }
            wallet.setHoldBalance(hold + deposit);
            wallet.setUpdatedAt(now);
            walletRepository.save(wallet);

            Transaction tx = new Transaction();
            tx.setWallet(wallet);
            tx.setAmount(deposit);
            tx.setTransactionType("HOLD_EVENT_DEPOSIT");
            tx.setStatus("COMPLETED");
            tx.setReferenceCode("EVENT-DEPOSIT-" + eventId + "-" + userId);
            tx.setDescription("Cọc tham gia sự kiện tiền ảo " + eventId);
            tx.setCreatedAt(now);
            transactionRepository.save(tx);

            registration.setDepositAmount(deposit);
            registration.setDepositStatus("HELD");
        } else {
            registration.setDepositStatus("NONE");
        }

        registrationRepository.save(registration);

        return EventResponse.fromEntity(event);
    }

    @Override
    @Transactional
    public void unregister(Long eventId, Long userId) {
        AuctionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (event.getStatus() == EventStatus.ONGOING) {
            throw new BusinessException("Không thể hủy đăng ký khi sự kiện đang diễn ra");
        }

        EventRegistration registration = registrationRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new BusinessException("Bạn chưa đăng ký sự kiện này"));

        // Release the registration deposit (VIRTUAL) before the event starts.
        if ("HELD".equalsIgnoreCase(registration.getDepositStatus())) {
            releaseDeposit(registration, "EVENT-DEPOSIT-REFUND-" + eventId + "-" + userId,
                    "Hoàn cọc do hủy đăng ký sự kiện " + eventId);
        }

        registration.setStatus(EventRegistrationStatus.CANCELLED);
        registrationRepository.save(registration);
    }

    /** Refunds a held registration deposit back to the bidder's available balance. */
    private void releaseDeposit(EventRegistration registration, String referenceCode, String description) {
        long deposit = registration.getDepositAmount() != null ? registration.getDepositAmount() : 0L;
        if (deposit <= 0) {
            registration.setDepositStatus("REFUNDED");
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        walletRepository.findByUserIdForUpdate(Math.toIntExact(registration.getUserId())).ifPresent(wallet -> {
            long hold = wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance();
            wallet.setHoldBalance(Math.max(0L, hold - deposit));
            wallet.setUpdatedAt(now);
            walletRepository.save(wallet);

            Transaction tx = new Transaction();
            tx.setWallet(wallet);
            tx.setAmount(deposit);
            tx.setTransactionType("REFUND_EVENT_DEPOSIT");
            tx.setStatus("COMPLETED");
            tx.setReferenceCode(referenceCode);
            tx.setDescription(description);
            tx.setCreatedAt(now);
            transactionRepository.save(tx);
        });
        registration.setDepositStatus("REFUNDED");
    }

    @Override
    public List<EventResponse> listMyEvents(Long userId) {
        return registrationRepository.findByUserIdAndStatus(userId, EventRegistrationStatus.REGISTERED)
                .stream()
                .map(reg -> eventRepository.findById(reg.getEventId()).orElse(null))
                .filter(event -> event != null)
                .map(EventResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
