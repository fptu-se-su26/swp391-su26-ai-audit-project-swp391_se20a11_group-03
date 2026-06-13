package com.auction.wallet.service.impl;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.wallet.dto.DepositQrResponse;
import com.auction.wallet.dto.SepayWebhookRequest;
import com.auction.wallet.dto.WalletResponse;
import com.auction.wallet.dto.WithdrawRequest;
import com.auction.wallet.dto.WithdrawalResponse;
import com.auction.wallet.dto.WithdrawalStatusRequest;
import com.auction.wallet.entity.Transaction;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.entity.WithdrawalRequest;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import com.auction.wallet.repository.WithdrawalRequestRepository;
import com.auction.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalletServiceImpl implements WalletService {

    private static final Pattern DEPOSIT_CONTENT_PATTERN = Pattern.compile("NAPTIEN\\s+(\\d+)", Pattern.CASE_INSENSITIVE);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;

    @Value("${sepay.bank-id:MB}")
    private String sepayBankId;

    @Value("${sepay.bank-account:0000000000}")
    private String sepayBankAccount;

    @Value("${sepay.account-name:LUXEAUCTION}")
    private String sepayAccountName;

    @Override
    @Transactional
    public WalletResponse getWalletByUserId(Long userId) {
        Wallet wallet = getOrCreateWallet(userId);

        return WalletResponse.builder()
                .walletId(wallet.getWalletId())
                .userId(wallet.getUser().getUserId())
                .balance(wallet.getBalance())
                .holdBalance(wallet.getHoldBalance())
                .status("ACTIVE")
                .build();
    }

    @Override
    @Transactional
    public DepositQrResponse createDepositQr(Long userId, Long amount) {
        if (amount == null || amount <= 0) {
            throw new IllegalStateException("Deposit amount must be greater than 0");
        }
        getOrCreateWallet(userId);

        String content = "NAPTIEN " + userId;
        String qrUrl = UriComponentsBuilder
                .fromUriString("https://img.vietqr.io/image/{bankId}-{account}-compact2.png")
                .queryParam("amount", amount)
                .queryParam("addInfo", content)
                .queryParam("accountName", sepayAccountName)
                .buildAndExpand(sepayBankId, sepayBankAccount)
                .toUriString();

        return DepositQrResponse.builder()
                .amount(amount)
                .bankId(sepayBankId)
                .bankAccount(sepayBankAccount)
                .accountName(sepayAccountName)
                .content(content)
                .qrUrl(qrUrl)
                .build();
    }

    @Override
    @Transactional
    public Map<String, Object> handleSepayWebhook(SepayWebhookRequest request) {
        if (request.getTransferAmount() == null || request.getTransferAmount() <= 0) {
            throw new IllegalStateException("Invalid transfer amount");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new IllegalStateException("Missing transfer content");
        }

        String referenceCode = request.getReferenceCode();
        if (referenceCode != null && !referenceCode.isBlank()
                && transactionRepository.findByReferenceCode(referenceCode).isPresent()) {
            return Map.of("processed", false, "message", "Duplicate webhook ignored");
        }

        Matcher matcher = DEPOSIT_CONTENT_PATTERN.matcher(request.getContent());
        if (!matcher.find()) {
            throw new IllegalStateException("Transfer content must include NAPTIEN [UserId]");
        }

        Long userId = Long.valueOf(matcher.group(1));
        Wallet wallet = getOrCreateWallet(userId);
        Long amount = request.getTransferAmount();
        wallet.setBalance((wallet.getBalance() == null ? 0L : wallet.getBalance()) + amount);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setTransactionType("DEPOSIT");
        transaction.setStatus("COMPLETED");
        transaction.setReferenceCode(referenceCode);
        transaction.setDescription("SePay deposit: " + request.getContent());
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        return Map.of(
                "processed", true,
                "userId", userId,
                "amount", amount,
                "balance", wallet.getBalance()
        );
    }

    @Override
    @Transactional
    public WithdrawalResponse createWithdrawal(Long userId, WithdrawRequest request) {
        Wallet wallet = getOrCreateWallet(userId);
        Long amount = request.getAmount();
        if (amount == null || amount <= 0) {
            throw new IllegalStateException("Withdrawal amount must be greater than 0");
        }
        if (wallet.getBalance() == null || wallet.getBalance() < amount) {
            throw new IllegalStateException("Insufficient wallet balance");
        }

        wallet.setBalance(wallet.getBalance() - amount);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        WithdrawalRequest withdrawal = new WithdrawalRequest();
        withdrawal.setUser(wallet.getUser());
        withdrawal.setWallet(wallet);
        withdrawal.setAmount(amount);
        withdrawal.setBankName(request.getBankName().trim());
        withdrawal.setAccountNumber(request.getAccountNumber().trim());
        withdrawal.setAccountName(request.getAccountName().trim());
        withdrawal.setStatus("PENDING");
        withdrawal.setCreatedAt(LocalDateTime.now());
        withdrawal.setUpdatedAt(LocalDateTime.now());
        withdrawal = withdrawalRequestRepository.save(withdrawal);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(amount);
        transaction.setTransactionType("WITHDRAWAL");
        transaction.setStatus("PENDING");
        transaction.setReferenceCode("WD-" + withdrawal.getWithdrawalRequestId());
        transaction.setDescription("Withdrawal request to " + withdrawal.getBankName() + " " + withdrawal.getAccountNumber());
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        return toWithdrawalResponse(withdrawal);
    }

    @Override
    public List<WithdrawalResponse> getWithdrawals(String status) {
        String normalized = status == null || status.isBlank()
                ? null
                : status.trim().toUpperCase(Locale.ROOT);
        List<WithdrawalRequest> withdrawals = normalized == null
                ? withdrawalRequestRepository.findAllByOrderByCreatedAtDesc()
                : withdrawalRequestRepository.findByStatusOrderByCreatedAtDesc(normalized);
        return withdrawals.stream().map(this::toWithdrawalResponse).toList();
    }

    @Override
    @Transactional
    public WithdrawalResponse updateWithdrawalStatus(Long id, WithdrawalStatusRequest request) {
        WithdrawalRequest withdrawal = withdrawalRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request not found: " + id));
        if (!"PENDING".equalsIgnoreCase(withdrawal.getStatus())) {
            throw new IllegalStateException("Only pending withdrawal requests can be updated");
        }

        String nextStatus = request.getStatus().trim().toUpperCase(Locale.ROOT);
        if (!"COMPLETED".equals(nextStatus) && !"REJECTED".equals(nextStatus)) {
            throw new IllegalStateException("Status must be COMPLETED or REJECTED");
        }

        withdrawal.setStatus(nextStatus);
        withdrawal.setStaffNote(request.getStaffNote());
        withdrawal.setUpdatedAt(LocalDateTime.now());

        if ("REJECTED".equals(nextStatus)) {
            Wallet wallet = withdrawal.getWallet();
            wallet.setBalance((wallet.getBalance() == null ? 0L : wallet.getBalance()) + withdrawal.getAmount());
            wallet.setUpdatedAt(LocalDateTime.now());
            walletRepository.save(wallet);
        }

        transactionRepository.findByReferenceCode("WD-" + withdrawal.getWithdrawalRequestId())
                .ifPresent(transaction -> {
                    transaction.setStatus(nextStatus);
                    transactionRepository.save(transaction);
                });

        return toWithdrawalResponse(withdrawalRequestRepository.save(withdrawal));
    }

    private Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUser_Id(Math.toIntExact(userId))
                .orElseGet(() -> {
                    User user = userRepository.findById(Math.toIntExact(userId))
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    Wallet wallet = new Wallet();
                    wallet.setUser(user);
                    wallet.setBalance(0L);
                    wallet.setHoldBalance(0L);
                    wallet.setUpdatedAt(LocalDateTime.now());
                    return walletRepository.save(wallet);
                });
    }

    private WithdrawalResponse toWithdrawalResponse(WithdrawalRequest withdrawal) {
        return WithdrawalResponse.builder()
                .id(withdrawal.getWithdrawalRequestId())
                .userId(withdrawal.getUser().getUserId())
                .userName(withdrawal.getUser().getFullName())
                .amount(withdrawal.getAmount())
                .bankName(withdrawal.getBankName())
                .accountNumber(withdrawal.getAccountNumber())
                .accountName(withdrawal.getAccountName())
                .status(withdrawal.getStatus())
                .staffNote(withdrawal.getStaffNote())
                .createdAt(withdrawal.getCreatedAt())
                .updatedAt(withdrawal.getUpdatedAt())
                .build();
    }
}
