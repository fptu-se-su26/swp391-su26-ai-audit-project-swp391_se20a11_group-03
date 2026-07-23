package com.auction.event.service.impl;

import com.auction.common.exception.BusinessException;
import com.auction.event.entity.EventProduct;
import com.auction.wallet.entity.Transaction;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Real-money wallet holds for REAL-money event auctions. Mirrors
 * {@code BiddingService.applyTimedWalletHold}: the current leader's bid is held
 * in their wallet and released when someone else takes the lead, so the winner
 * always has real funds to pay. Callers must invoke these only for
 * {@code EventMoneyMode.REAL} events (VIRTUAL events bid with free play money).
 *
 * All methods must run inside the caller's transaction + product lock; wallet
 * rows are locked with {@code findByUserIdForUpdate}.
 */
@Service
@RequiredArgsConstructor
public class EventBidWalletService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Ascending modes (Standard / Penny / Dutch): hold {@code newAmount} for the
     * new leader, releasing the previous leader's hold (tracked on the product).
     * Handles the same bidder raising their own bid. Sets {@code product.heldAmount}.
     * Throws if the bidder's available balance can't cover the new amount.
     */
    public void applyAscendingHold(EventProduct product, Long userId, long newAmount) {
        if (newAmount <= 0) {
            throw new BusinessException("Số tiền đặt giá không hợp lệ");
        }
        Long prevLeader = product.getWinnerId();
        long prevHeld = product.getHeldAmount() == null ? 0L : product.getHeldAmount();
        LocalDateTime now = LocalDateTime.now();

        Wallet wallet = walletRepository.findByUserIdForUpdate(Math.toIntExact(userId))
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví của bạn để khóa tiền đặt giá"));
        long balance = wallet.getBalance() == null ? 0L : wallet.getBalance();
        long hold = wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance();
        long ownExisting = (prevLeader != null && prevLeader.equals(userId)) ? prevHeld : 0L;
        if (balance - hold + ownExisting < newAmount) {
            throw new BusinessException("Số dư ví khả dụng không đủ để đặt giá này");
        }

        if (prevLeader != null && !prevLeader.equals(userId) && prevHeld > 0) {
            releaseHold(prevLeader, prevHeld, product.getEventProductId(), "Giải phóng tiền đặt giá do bị vượt giá");
        }

        wallet.setHoldBalance(hold - ownExisting + newAmount);
        wallet.setUpdatedAt(now);
        walletRepository.save(wallet);
        record(wallet, newAmount, "HOLD_EVENT_BID",
                "EVENT-BID-HOLD-" + product.getEventProductId() + "-" + userId + "-" + now.toString(),
                "Khóa tiền đặt giá sự kiện cho sản phẩm " + product.getEventProductId(), now);

        product.setHeldAmount(newAmount);
    }

    /**
     * Sealed bids: each bidder holds their own (hidden) bid. Releases the bidder's
     * previous hold if they revise their bid. No leader tracking here — losers are
     * released at reveal via {@link #releaseHold}.
     */
    public void applySealedHold(Long userId, long newAmount, long oldAmount, Long eventProductId) {
        if (newAmount <= 0) {
            throw new BusinessException("Số tiền đặt giá không hợp lệ");
        }
        LocalDateTime now = LocalDateTime.now();
        Wallet wallet = walletRepository.findByUserIdForUpdate(Math.toIntExact(userId))
                .orElseThrow(() -> new BusinessException("Không tìm thấy ví của bạn để khóa tiền đặt giá"));
        long balance = wallet.getBalance() == null ? 0L : wallet.getBalance();
        long hold = wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance();
        if (balance - hold + oldAmount < newAmount) {
            throw new BusinessException("Số dư ví khả dụng không đủ để đặt giá kín này");
        }
        wallet.setHoldBalance(hold - oldAmount + newAmount);
        wallet.setUpdatedAt(now);
        walletRepository.save(wallet);
        record(wallet, newAmount, "HOLD_EVENT_BID",
                "EVENT-SEALED-HOLD-" + eventProductId + "-" + userId + "-" + now.toString(),
                "Khóa tiền đặt giá kín cho sản phẩm " + eventProductId, now);
    }

    /** Releases a held amount back to the user's available balance. */
    public void releaseHold(Long userId, long amount, Long eventProductId, String description) {
        if (amount <= 0) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        walletRepository.findByUserIdForUpdate(Math.toIntExact(userId)).ifPresent(wallet -> {
            long hold = wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance();
            wallet.setHoldBalance(Math.max(0L, hold - amount));
            wallet.setUpdatedAt(now);
            walletRepository.save(wallet);
            record(wallet, amount, "REFUND_EVENT_BID",
                    "EVENT-BID-REFUND-" + eventProductId + "-" + userId + "-" + now.toString(),
                    description, now);
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
