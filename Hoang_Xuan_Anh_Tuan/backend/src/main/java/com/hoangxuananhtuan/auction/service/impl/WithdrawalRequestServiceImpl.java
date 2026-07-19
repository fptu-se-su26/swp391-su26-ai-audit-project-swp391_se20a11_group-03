package com.hoangxuananhtuan.auction.service.impl;

import com.hoangxuananhtuan.auction.domain.Transaction;
import com.hoangxuananhtuan.auction.domain.User;
import com.hoangxuananhtuan.auction.domain.Wallet;
import com.hoangxuananhtuan.auction.domain.WithdrawalRequest;
import com.hoangxuananhtuan.auction.dto.WithdrawalRequestCreateRequest;
import com.hoangxuananhtuan.auction.dto.WithdrawalRequestResponse;
import com.hoangxuananhtuan.auction.exception.ResourceNotFoundException;
import com.hoangxuananhtuan.auction.repository.TransactionRepository;
import com.hoangxuananhtuan.auction.repository.UserRepository;
import com.hoangxuananhtuan.auction.repository.WalletRepository;
import com.hoangxuananhtuan.auction.repository.WithdrawalRequestRepository;
import com.hoangxuananhtuan.auction.service.WithdrawalRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WithdrawalRequestServiceImpl implements WithdrawalRequestService {

    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public WithdrawalRequestResponse createWithdrawalRequest(WithdrawalRequestCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        Wallet wallet = walletRepository.findByUser_UserId(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + request.getUserId()));

        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be greater than 0");
        }
        if (wallet.getBalance() == null || wallet.getBalance() < request.getAmount()) {
            throw new IllegalArgumentException("Insufficient wallet balance");
        }

        wallet.setBalance(wallet.getBalance() - request.getAmount());
        wallet.setHoldBalance((wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance()) + request.getAmount());
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        WithdrawalRequest withdrawalRequest = new WithdrawalRequest();
        withdrawalRequest.setWallet(wallet);
        withdrawalRequest.setAmount(request.getAmount());
        withdrawalRequest.setBankAccount(request.getBankAccount());
        withdrawalRequest.setBankName(request.getBankName());
        withdrawalRequest.setAccountHolder(request.getAccountHolder());
        withdrawalRequest.setStatus("PENDING");
        withdrawalRequest.setCreatedAt(LocalDateTime.now());
        withdrawalRequest = withdrawalRequestRepository.save(withdrawalRequest);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType("WITHDRAW_REQUEST");
        transaction.setStatus("PENDING");
        transaction.setDescription("Create withdrawal request #" + withdrawalRequest.getWithdrawalRequestId());
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        return map(withdrawalRequest, "Withdrawal request created successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<WithdrawalRequestResponse> getMyWithdrawalRequests(Long userId) {
        return withdrawalRequestRepository.findByWallet_User_UserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::map).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WithdrawalRequestResponse> getPendingWithdrawalRequests() {
        return withdrawalRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING")
                .stream().map(this::map).toList();
    }

    @Override
    public WithdrawalRequestResponse approveWithdrawalRequest(Long requestId, Long reviewerId) {
        WithdrawalRequest request = withdrawalRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request not found with id: " + requestId));
        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Withdrawal request is not pending");
        }

        request.setStatus("APPROVED");
        request.setReviewedBy(reviewerId);
        request.setReviewedAt(LocalDateTime.now());
        withdrawalRequestRepository.save(request);

        Transaction transaction = new Transaction();
        transaction.setWallet(request.getWallet());
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType("WITHDRAW_APPROVED");
        transaction.setStatus("COMPLETED");
        transaction.setDescription("Withdrawal approved and waiting for manual bank transfer");
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        return map(request, "Withdrawal request approved");
    }

    @Override
    public WithdrawalRequestResponse rejectWithdrawalRequest(Long requestId, Long reviewerId) {
        WithdrawalRequest request = withdrawalRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Withdrawal request not found with id: " + requestId));
        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Withdrawal request is not pending");
        }

        Wallet wallet = request.getWallet();
        wallet.setBalance((wallet.getBalance() == null ? 0L : wallet.getBalance()) + request.getAmount());
        wallet.setHoldBalance((wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance()) - request.getAmount());
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        request.setStatus("REJECTED");
        request.setReviewedBy(reviewerId);
        request.setReviewedAt(LocalDateTime.now());
        withdrawalRequestRepository.save(request);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType("WITHDRAW_REJECTED");
        transaction.setStatus("COMPLETED");
        transaction.setDescription("Withdrawal rejected and funds returned to balance");
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        return map(request, "Withdrawal request rejected");
    }

    private WithdrawalRequestResponse map(WithdrawalRequest request) {
        return map(request, null);
    }

    private WithdrawalRequestResponse map(WithdrawalRequest request, String message) {
        return WithdrawalRequestResponse.builder()
                .withdrawalRequestId(request.getWithdrawalRequestId())
                .walletId(request.getWallet() != null ? request.getWallet().getWalletId() : null)
                .userId(request.getWallet() != null && request.getWallet().getUser() != null ? request.getWallet().getUser().getUserId() : null)
                .amount(request.getAmount())
                .bankAccount(request.getBankAccount())
                .bankName(request.getBankName())
                .accountHolder(request.getAccountHolder())
                .status(request.getStatus())
                .reviewedBy(request.getReviewedBy())
                .reviewedAt(request.getReviewedAt())
                .createdAt(request.getCreatedAt())
                .message(message)
                .build();
    }
}
