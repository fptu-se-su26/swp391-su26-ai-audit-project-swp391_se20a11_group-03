package com.auction.wallet.service.impl;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.bidding.entity.AuctionDeposit;
import com.auction.bidding.repository.AuctionDepositRepository;
import com.auction.bidding.util.DepositCalculator;
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
import com.auction.notification.entity.Notification;
import com.auction.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalletServiceImpl implements WalletService {

    private static final Pattern DEPOSIT_CONTENT_PATTERN = Pattern.compile("NAPTIEN\\s*(\\d+)", Pattern.CASE_INSENSITIVE);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final WithdrawalRequestRepository withdrawalRequestRepository;
    private final AuctionDepositRepository auctionDepositRepository;
    private final NotificationService notificationService;

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
        normalizeLegacyAuctionDeposits(wallet);

        return WalletResponse.builder()
                .walletId(wallet.getWalletId())
                .userId(wallet.getUser().getUserId())
                .balance(wallet.getBalance())
                .holdBalance(wallet.getHoldBalance())
                .availableBalance(availableBalance(wallet))
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
    public void handleSepayWebhook(SepayWebhookRequest request) {
        if (request.getTransferType() != null
                && !request.getTransferType().isBlank()
                && !"in".equalsIgnoreCase(request.getTransferType())) {
            return;
        }
        if (request.getAccountNumber() != null
                && !request.getAccountNumber().isBlank()
                && !sepayBankAccount.equals(request.getAccountNumber().trim())) {
            return;
        }
        if (request.getTransferAmount() == null || request.getTransferAmount() <= 0) {
            throw new IllegalStateException("Invalid transfer amount");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new IllegalStateException("Missing transfer content");
        }

        String referenceCode = request.getId() != null
                ? "SEPAY-" + request.getId()
                : request.getReferenceCode();
        if (referenceCode != null && !referenceCode.isBlank()
                && transactionRepository.findByReferenceCode(referenceCode).isPresent()) {
            return;
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

    }

    @Override
    @Transactional
    public WithdrawalResponse createWithdrawal(Long userId, WithdrawRequest request) {
        Wallet wallet = getOrCreateWallet(userId);
        normalizeLegacyAuctionDeposits(wallet);
        normalizeLegacyPendingWithdrawals(wallet);
        Long amount = request.getAmount();
        if (amount == null || amount <= 0) {
            throw new IllegalStateException("Withdrawal amount must be greater than 0");
        }
        if (availableBalance(wallet) < amount) {
            throw new IllegalStateException("Insufficient wallet balance");
        }

        wallet.setHoldBalance((wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance()) + amount);
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
    public List<WithdrawalResponse> getWithdrawalsByUserId(Long userId) {
        return withdrawalRequestRepository.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toWithdrawalResponse)
                .toList();
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

        Wallet wallet = withdrawal.getWallet();
        normalizeLegacyPendingWithdrawals(wallet);
        long hold = wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance();
        long lockedForThis = Math.min(withdrawal.getAmount(), hold);

        if ("COMPLETED".equals(nextStatus)) {
            long balance = wallet.getBalance() == null ? 0L : wallet.getBalance();
            if (balance < withdrawal.getAmount()) {
                throw new IllegalStateException("Insufficient wallet balance to complete withdrawal");
            }
            wallet.setBalance(balance - withdrawal.getAmount());
            wallet.setHoldBalance(Math.max(0L, hold - lockedForThis));
            wallet.setUpdatedAt(LocalDateTime.now());
            walletRepository.save(wallet);

            String amountText = formatVnd(withdrawal.getAmount());
            notificationService.createNotification(
                    withdrawal.getUser().getUserId(),
                    "Rút tiền thành công",
                    "Yêu cầu rút " + amountText + " đã được chuyển khoản vào tài khoản "
                            + withdrawal.getBankName() + " " + maskAccount(withdrawal.getAccountNumber()) + ".",
                    Notification.NotificationType.WITHDRAWAL_APPROVED,
                    withdrawal.getWithdrawalRequestId(),
                    "WITHDRAWAL"
            );
        } else if ("REJECTED".equals(nextStatus)) {
            wallet.setHoldBalance(Math.max(0L, hold - lockedForThis));
            wallet.setUpdatedAt(LocalDateTime.now());
            walletRepository.save(wallet);

            String amountText = formatVnd(withdrawal.getAmount());
            String note = request.getStaffNote() != null && !request.getStaffNote().isBlank()
                    ? " Lý do: " + request.getStaffNote().trim()
                    : "";
            notificationService.createNotification(
                    withdrawal.getUser().getUserId(),
                    "Yêu cầu rút tiền bị từ chối",
                    "Yêu cầu rút " + amountText + " không được duyệt." + note,
                    Notification.NotificationType.WITHDRAWAL_REJECTED,
                    withdrawal.getWithdrawalRequestId(),
                    "WITHDRAWAL"
            );
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

    private static long availableBalance(Wallet wallet) {
        long balance = wallet.getBalance() == null ? 0L : wallet.getBalance();
        long hold = wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance();
        return Math.max(0L, balance - hold);
    }

    /**
     * Older deposit logic deducted Balance and increased HoldBalance. The wallet
     * model now keeps Balance as total funds and reserves deposits only in
     * HoldBalance, so active legacy deposits need a one-time credit back.
     */
    private void normalizeLegacyAuctionDeposits(Wallet wallet) {
        Integer userId = wallet.getUser().getId();
        LocalDateTime now = LocalDateTime.now();
        long balanceCredit = 0L;
        long holdReduction = 0L;

        for (AuctionDeposit deposit : auctionDepositRepository.findByUser_Id(userId)) {
            if (deposit.getDepositId() == null || deposit.getAuction() == null) {
                continue;
            }
            String status = deposit.getStatus();
            if (!"LOCKED".equalsIgnoreCase(status) && !"HELD_FOR_PAYMENT".equalsIgnoreCase(status)) {
                continue;
            }
            String migrationRef = "DEPOSIT-ACCOUNTING-V2-" + deposit.getDepositId();
            String newFlowRef = "DEPOSIT-HOLD-" + deposit.getAuction().getAuctionId() + "-" + userId;
            if (transactionRepository.findByReferenceCode(migrationRef).isPresent()
                    || transactionRepository.findByReferenceCode(newFlowRef).isPresent()) {
                continue;
            }

            long legacyAmount = deposit.getDepositAmount() == null ? 0L : deposit.getDepositAmount();
            if (legacyAmount <= 0) {
                continue;
            }
            long expectedAmount = legacyAmount;
            if (deposit.getAuction().getProduct() != null
                    && deposit.getAuction().getProduct().getStartingPrice() != null) {
                expectedAmount = DepositCalculator.calculate(deposit.getAuction().getProduct().getStartingPrice());
            }

            balanceCredit += legacyAmount;
            if (legacyAmount > expectedAmount) {
                holdReduction += legacyAmount - expectedAmount;
                deposit.setDepositAmount(expectedAmount);
                auctionDepositRepository.save(deposit);
            }

            Transaction tx = new Transaction();
            tx.setWallet(wallet);
            tx.setAmount(legacyAmount);
            tx.setTransactionType("DEPOSIT_ACCOUNTING_MIGRATION");
            tx.setStatus("COMPLETED");
            tx.setReferenceCode(migrationRef);
            tx.setDescription("Normalize legacy auction deposit accounting for deposit " + deposit.getDepositId());
            tx.setCreatedAt(now);
            transactionRepository.save(tx);
        }

        if (balanceCredit <= 0 && holdReduction <= 0) {
            return;
        }
        long balance = wallet.getBalance() == null ? 0L : wallet.getBalance();
        long hold = wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance();
        wallet.setBalance(balance + balanceCredit);
        wallet.setHoldBalance(Math.max(0L, hold - holdReduction));
        wallet.setUpdatedAt(now);
        walletRepository.save(wallet);
    }

    /**
     * Older builds deducted balance immediately on withdrawal request. Re-lock those
     * amounts in holdBalance so available balance stays correct under the new flow.
     */
    private void normalizeLegacyPendingWithdrawals(Wallet wallet) {
        long pendingSum = withdrawalRequestRepository.findByUser_IdOrderByCreatedAtDesc(wallet.getUser().getUserId())
                .stream()
                .filter(w -> "PENDING".equalsIgnoreCase(w.getStatus()))
                .mapToLong(WithdrawalRequest::getAmount)
                .sum();
        if (pendingSum <= 0) {
            return;
        }
        long hold = wallet.getHoldBalance() == null ? 0L : wallet.getHoldBalance();
        if (hold >= pendingSum) {
            return;
        }
        long missingHold = pendingSum - hold;
        long balance = wallet.getBalance() == null ? 0L : wallet.getBalance();
        wallet.setBalance(balance + missingHold);
        wallet.setHoldBalance(hold + missingHold);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);
    }

    private static String formatVnd(long amount) {
        return String.format("%,d VND", amount).replace(',', '.');
    }

    private static String maskAccount(String accountNumber) {
        if (accountNumber == null || accountNumber.length() < 4) {
            return "****";
        }
        return "****" + accountNumber.substring(accountNumber.length() - 4);
    }
}
