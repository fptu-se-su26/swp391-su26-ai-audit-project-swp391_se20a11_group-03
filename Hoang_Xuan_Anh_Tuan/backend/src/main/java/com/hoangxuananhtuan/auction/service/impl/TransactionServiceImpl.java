package com.hoangxuananhtuan.auction.service.impl;

import com.hoangxuananhtuan.auction.domain.Transaction;
import com.hoangxuananhtuan.auction.dto.TransactionResponse;
import com.hoangxuananhtuan.auction.exception.ResourceNotFoundException;
import com.hoangxuananhtuan.auction.repository.TransactionRepository;
import com.hoangxuananhtuan.auction.repository.WalletRepository;
import com.hoangxuananhtuan.auction.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionServiceImpl implements TransactionService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;

    @Override
    public List<TransactionResponse> getWalletTransactions(Long userId) {
        var wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        return transactionRepository.findAll().stream()
                .filter(t -> t.getWallet() != null && t.getWallet().getWalletId().equals(wallet.getWalletId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::map)
                .toList();
    }

    private TransactionResponse map(Transaction transaction) {
        long signedAmount = computeSignedAmount(transaction.getTransactionType(), transaction.getAmount());
        return TransactionResponse.builder()
                .transactionId(transaction.getTransactionId())
                .walletId(transaction.getWallet() != null ? transaction.getWallet().getWalletId() : null)
                .userId(transaction.getWallet() != null && transaction.getWallet().getUser() != null ? transaction.getWallet().getUser().getUserId() : null)
                .amount(transaction.getAmount())
                .signedAmount(signedAmount)
                .amountLabel(formatAmountLabel(transaction.getTransactionType(), transaction.getAmount()))
                .transactionType(transaction.getTransactionType())
                .transactionTypeLabel(formatTransactionType(transaction.getTransactionType()))
                .status(transaction.getStatus())
                .statusLabel(formatStatus(transaction.getStatus()))
                .referenceCode(transaction.getReferenceCode())
                .description(transaction.getDescription())
                .createdAt(transaction.getCreatedAt())
                .createdAtLabel(transaction.getCreatedAt() != null ? transaction.getCreatedAt().format(TIME_FORMATTER) : null)
                .build();
    }

    private long computeSignedAmount(String transactionType, Long amount) {
        long value = amount == null ? 0L : amount;
        if (transactionType == null) return value;
        return switch (transactionType) {
            case "HOLD_BID", "WITHDRAW_REQUEST" -> -value;
            default -> value;
        };
    }

    private String formatAmountLabel(String transactionType, Long amount) {
        long signed = computeSignedAmount(transactionType, amount);
        String prefix = signed < 0 ? "-" : "+";
        return prefix + Math.abs(signed) + " VND";
    }

    private String formatTransactionType(String transactionType) {
        if (transactionType == null) return "Không xác định";
        return switch (transactionType) {
            case "HOLD_BID" -> "Khóa tiền cọc";
            case "WITHDRAW_REQUEST" -> "Tạo lệnh rút";
            case "WITHDRAW_APPROVED" -> "Duyệt lệnh rút";
            case "WITHDRAW_REJECTED" -> "Từ chối lệnh rút";
            default -> transactionType;
        };
    }

    private String formatStatus(String status) {
        if (status == null) return "Không xác định";
        return switch (status) {
            case "COMPLETED" -> "Hoàn tất";
            case "PENDING" -> "Đang chờ";
            case "FAILED" -> "Thất bại";
            case "REJECTED" -> "Bị từ chối";
            default -> status;
        };
    }
}
