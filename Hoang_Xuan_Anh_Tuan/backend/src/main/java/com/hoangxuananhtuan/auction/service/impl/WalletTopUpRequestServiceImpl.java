package com.hoangxuananhtuan.auction.service.impl;

import com.hoangxuananhtuan.auction.domain.Transaction;
import com.hoangxuananhtuan.auction.domain.User;
import com.hoangxuananhtuan.auction.domain.Wallet;
import com.hoangxuananhtuan.auction.domain.WalletTopUpRequest;
import com.hoangxuananhtuan.auction.dto.WalletTopUpRequestCreateRequest;
import com.hoangxuananhtuan.auction.dto.WalletTopUpRequestResponse;
import com.hoangxuananhtuan.auction.exception.ResourceNotFoundException;
import com.hoangxuananhtuan.auction.repository.TransactionRepository;
import com.hoangxuananhtuan.auction.repository.UserRepository;
import com.hoangxuananhtuan.auction.repository.WalletRepository;
import com.hoangxuananhtuan.auction.repository.WalletTopUpRequestRepository;
import com.hoangxuananhtuan.auction.service.WalletTopUpRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WalletTopUpRequestServiceImpl implements WalletTopUpRequestService {

    private final WalletTopUpRequestRepository topUpRequestRepository;
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Override
    public WalletTopUpRequestResponse createTopUpRequest(WalletTopUpRequestCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));
        Wallet wallet = walletRepository.findByUser_UserId(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + request.getUserId()));

        if (request.getAmount() == null || request.getAmount() <= 0) {
            throw new IllegalArgumentException("Top up amount must be greater than 0");
        }
        if (request.getPaymentMethod() == null || request.getPaymentMethod().isBlank()) {
            throw new IllegalArgumentException("Payment method is required");
        }

        wallet.setBalance((wallet.getBalance() == null ? 0L : wallet.getBalance()) + request.getAmount());
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        WalletTopUpRequest topUpRequest = new WalletTopUpRequest();
        topUpRequest.setWallet(wallet);
        topUpRequest.setAmount(request.getAmount());
        topUpRequest.setPaymentMethod(request.getPaymentMethod());
        topUpRequest.setReferenceCode(request.getReferenceCode());
        topUpRequest.setStatus("APPROVED");
        topUpRequest.setReviewedBy(null);
        topUpRequest.setReviewedAt(LocalDateTime.now());
        topUpRequest.setCreatedAt(LocalDateTime.now());
        topUpRequest = topUpRequestRepository.save(topUpRequest);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType("TOPUP_DIRECT");
        transaction.setStatus("COMPLETED");
        transaction.setReferenceCode(request.getReferenceCode());
        transaction.setDescription("Auto top up by bank transfer reference #" + topUpRequest.getTopUpRequestId());
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        return map(topUpRequest, "Nạp tiền thành công qua ngân hàng");
    }

    @Override
    @Transactional(readOnly = true)
    public List<WalletTopUpRequestResponse> getMyTopUpRequests(Long userId) {
        return topUpRequestRepository.findByWallet_User_UserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::map).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WalletTopUpRequestResponse> getPendingTopUpRequests() {
        return topUpRequestRepository.findByStatusOrderByCreatedAtDesc("PENDING")
                .stream().map(this::map).toList();
    }

    @Override
    public WalletTopUpRequestResponse approveTopUpRequest(Long requestId, Long reviewerId) {
        WalletTopUpRequest request = topUpRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Top up request not found with id: " + requestId));
        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Top up request is not pending");
        }

        Wallet wallet = request.getWallet();
        wallet.setBalance((wallet.getBalance() == null ? 0L : wallet.getBalance()) + request.getAmount());
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        request.setStatus("APPROVED");
        request.setReviewedBy(reviewerId);
        request.setReviewedAt(LocalDateTime.now());
        topUpRequestRepository.save(request);

        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType("TOPUP_APPROVED");
        transaction.setStatus("COMPLETED");
        transaction.setReferenceCode(request.getReferenceCode());
        transaction.setDescription("Top up approved and balance credited");
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        return map(request, "Top up request approved");
    }

    @Override
    public WalletTopUpRequestResponse rejectTopUpRequest(Long requestId, Long reviewerId) {
        WalletTopUpRequest request = topUpRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Top up request not found with id: " + requestId));
        if (!"PENDING".equals(request.getStatus())) {
            throw new IllegalStateException("Top up request is not pending");
        }

        request.setStatus("REJECTED");
        request.setReviewedBy(reviewerId);
        request.setReviewedAt(LocalDateTime.now());
        topUpRequestRepository.save(request);

        Transaction transaction = new Transaction();
        transaction.setWallet(request.getWallet());
        transaction.setAmount(request.getAmount());
        transaction.setTransactionType("TOPUP_REJECTED");
        transaction.setStatus("COMPLETED");
        transaction.setReferenceCode(request.getReferenceCode());
        transaction.setDescription("Top up rejected");
        transaction.setCreatedAt(LocalDateTime.now());
        transactionRepository.save(transaction);

        return map(request, "Top up request rejected");
    }

    private WalletTopUpRequestResponse map(WalletTopUpRequest request) {
        return map(request, null);
    }

    private WalletTopUpRequestResponse map(WalletTopUpRequest request, String message) {
        return WalletTopUpRequestResponse.builder()
                .topUpRequestId(request.getTopUpRequestId())
                .walletId(request.getWallet() != null ? request.getWallet().getWalletId() : null)
                .userId(request.getWallet() != null && request.getWallet().getUser() != null ? request.getWallet().getUser().getUserId() : null)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .referenceCode(request.getReferenceCode())
                .status(request.getStatus())
                .reviewedBy(request.getReviewedBy())
                .reviewedAt(request.getReviewedAt())
                .createdAt(request.getCreatedAt())
                .message(message)
                .build();
    }
}
