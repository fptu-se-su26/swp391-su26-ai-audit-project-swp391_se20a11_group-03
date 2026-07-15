package com.auction.wallet.service.impl;

import com.auction.account.entity.User;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.wallet.dto.WalletTransactionDTO;
import com.auction.wallet.entity.Transaction;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import com.auction.wallet.service.TransactionLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionLedgerServiceImpl implements TransactionLedgerService {

    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public List<WalletTransactionDTO> getUserTransactions(Long userId, LocalDate from, LocalDate to, String type) {
        Wallet wallet = walletRepository.findByUser_Id(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user " + userId));
        DateRange range = resolveRange(from, to);
        return transactionRepository
                .findWalletTransactions(wallet.getWalletId(), range.from(), range.to())
                .stream()
                .filter(t -> matchesType(t, type))
                .map(this::toDto)
                .sorted(Comparator.comparing(WalletTransactionDTO::getCreatedAt).reversed())
                .toList();
    }

    @Override
    public List<WalletTransactionDTO> getAdminLedger(LocalDate from, LocalDate to, Long userId, String type) {
        DateRange range = resolveRange(from, to);
        return transactionRepository
                .findAllTransactions(range.from(), range.to(), userId)
                .stream()
                .filter(t -> matchesType(t, type))
                .map(this::toDto)
                .sorted(Comparator.comparing(WalletTransactionDTO::getCreatedAt).reversed())
                .toList();
    }

    private boolean matchesType(Transaction t, String type) {
        if (type == null || type.isBlank()) {
            return true;
        }
        return t.getTransactionType() != null
                && t.getTransactionType().equalsIgnoreCase(type.trim());
    }

    private DateRange resolveRange(LocalDate from, LocalDate to) {
        LocalDate end = to != null ? to : LocalDate.now();
        LocalDate start = from != null ? from : end.minusDays(29);
        if (start.isAfter(end)) {
            LocalDate tmp = start;
            start = end;
            end = tmp;
        }
        return new DateRange(start.atStartOfDay(), end.plusDays(1).atStartOfDay());
    }

    private WalletTransactionDTO toDto(Transaction t) {
        User user = t.getWallet() != null ? t.getWallet().getUser() : null;
        long amount = t.getAmount() != null ? t.getAmount() : 0L;
        boolean credit = isCredit(t.getTransactionType());
        return WalletTransactionDTO.builder()
                .transactionId(t.getTransactionId())
                .walletId(t.getWallet() != null ? t.getWallet().getWalletId() : null)
                .userId(user != null ? user.getUserId() : null)
                .userName(user != null ? displayName(user) : "—")
                .transactionType(t.getTransactionType())
                .transactionTypeLabel(labelFor(t.getTransactionType()))
                .amount(amount)
                .signedAmount(credit ? amount : -amount)
                .direction(credit ? "CREDIT" : "DEBIT")
                .status(t.getStatus())
                .referenceCode(t.getReferenceCode())
                .description(t.getDescription())
                .createdAt(t.getCreatedAt() != null ? t.getCreatedAt().toString() : null)
                .build();
    }

    private boolean isCredit(String type) {
        if (type == null) {
            return false;
        }
        return switch (type.toUpperCase(Locale.ROOT)) {
            case "DEPOSIT", "REFUND_DEPOSIT", "AUCTION_PAYOUT",
                 "PLATFORM_COMMISSION", "ADMIN_AUCTION_REVENUE", "FORFEIT_DEPOSIT" -> true;
            default -> false;
        };
    }

    private String labelFor(String type) {
        if (type == null) {
            return "—";
        }
        return switch (type.toUpperCase(Locale.ROOT)) {
            case "DEPOSIT" -> "Nạp tiền";
            case "WITHDRAWAL" -> "Rút tiền";
            case "HOLD_BID" -> "Đặt cọc đấu giá";
            case "AUCTION_PAYMENT" -> "Thanh toán phiên thắng";
            case "AUCTION_PAYOUT" -> "Nhận doanh thu bán hàng";
            case "PLATFORM_COMMISSION" -> "Phí nền tảng";
            case "ADMIN_AUCTION_REVENUE" -> "Doanh thu đấu giá (admin)";
            case "REFUND_DEPOSIT" -> "Hoàn tiền cọc";
            case "FORFEIT_DEPOSIT" -> "Thu cọc quá hạn";
            default -> type;
        };
    }

    private String displayName(User user) {
        String name = user.getFullName();
        if (name == null || name.isBlank()) {
            name = user.getEmail();
        }
        return name != null ? name : ("#" + user.getUserId());
    }

    private record DateRange(LocalDateTime from, LocalDateTime to) {}
}
