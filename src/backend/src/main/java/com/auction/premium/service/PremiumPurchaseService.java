package com.auction.premium.service;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.common.exception.BusinessException;
import com.auction.common.exception.ResourceNotFoundException;
import com.auction.premium.dto.PremiumPlan;
import com.auction.premium.dto.PremiumPurchaseResponse;
import com.auction.wallet.entity.Transaction;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.TransactionRepository;
import com.auction.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class PremiumPurchaseService {

    public static final long SELLER_MONTHLY_PRICE = 30_000_000L;
    public static final long SELLER_YEARLY_PRICE = 300_000_000L;
    public static final long USER_MONTHLY_PRICE = 10_000_000L;
    public static final long USER_YEARLY_PRICE = 100_000_000L;
    private static final String TRANSACTION_TYPE = "PREMIUM_PURCHASE";
    private static final String ADMIN_REVENUE_TRANSACTION_TYPE = "PREMIUM_REVENUE";

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public PremiumPurchaseResponse status(Long userId) {
        User account = findEligibleAccount(userId);
        Wallet wallet = walletRepository.findByUser_Id(Math.toIntExact(userId)).orElse(null);
        long availableBalance = wallet == null ? 0L : availableBalance(wallet);
        LocalDateTime expiresAt = wallet == null ? null : calculateExpiresAt(wallet.getWalletId());
        boolean active = isActive(expiresAt, LocalDateTime.now());
        return response(
                account,
                active,
                availableBalance,
                expiresAt,
                active ? "Tài khoản Premium đang hoạt động" : "Có thể đăng ký Premium"
        );
    }

    @Transactional
    public PremiumPurchaseResponse purchase(Long userId, PremiumPlan plan) {
        if (plan == null) {
            throw new BusinessException("Vui lòng chọn chu kỳ Premium");
        }

        User account = findEligibleAccount(userId);
        Wallet wallet = walletRepository.findByUserIdForUpdate(Math.toIntExact(userId))
                .orElseThrow(() -> new BusinessException("Số dư ví không đủ. Vui lòng nạp tiền trước khi đăng ký Premium"));

        boolean sellerAccount = isSeller(account);
        long price = priceFor(plan, sellerAccount);
        long availableBalance = availableBalance(wallet);
        if (availableBalance < price) {
            throw new BusinessException("Số dư khả dụng không đủ để thanh toán gói Premium đã chọn");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime currentExpiresAt = calculateExpiresAt(wallet.getWalletId());
        boolean renewing = isActive(currentExpiresAt, now);
        LocalDateTime expiresAt = extendExpiration(currentExpiresAt, now, plan);

        wallet.setBalance(safeAmount(wallet.getBalance()) - price);
        wallet.setUpdatedAt(now);
        walletRepository.save(wallet);

        String referenceCode = "PREMIUM-" + plan.name() + "-" + userId + "-" + System.currentTimeMillis();
        Transaction transaction = new Transaction();
        transaction.setWallet(wallet);
        transaction.setAmount(price);
        transaction.setTransactionType(TRANSACTION_TYPE);
        transaction.setStatus("COMPLETED");
        transaction.setReferenceCode(referenceCode);
        transaction.setDescription("Premium " + plan.name() + " subscription");
        transaction.setCreatedAt(now);
        transactionRepository.save(transaction);

        // Premium subscription fees are platform revenue: credit the admin wallet
        // so this shows up alongside shipping fees / auction commission in the
        // admin revenue dashboard, instead of the money just disappearing.
        Wallet adminWallet = getAdminWallet(now);
        if (adminWallet != null) {
            adminWallet.setBalance(safeAmount(adminWallet.getBalance()) + price);
            adminWallet.setUpdatedAt(now);
            walletRepository.save(adminWallet);

            Transaction adminTransaction = new Transaction();
            adminTransaction.setWallet(adminWallet);
            adminTransaction.setAmount(price);
            adminTransaction.setTransactionType(ADMIN_REVENUE_TRANSACTION_TYPE);
            adminTransaction.setStatus("COMPLETED");
            adminTransaction.setReferenceCode("REV-" + referenceCode);
            adminTransaction.setDescription("Premium " + plan.name() + " subscription revenue (user " + userId + ")");
            adminTransaction.setCreatedAt(now);
            transactionRepository.save(adminTransaction);
        }

        return response(
                account,
                true,
                availableBalance(wallet),
                expiresAt,
                renewing ? "Gia hạn Premium thành công" : "Đăng ký Premium thành công"
        );
    }

    private LocalDateTime calculateExpiresAt(Long walletId) {
        List<Transaction> purchases = transactionRepository
                .findByWallet_WalletIdAndTransactionTypeAndStatusOrderByCreatedAtAsc(
                        walletId,
                        TRANSACTION_TYPE,
                        "COMPLETED"
                );
        LocalDateTime expiresAt = null;
        for (Transaction purchase : purchases) {
            PremiumPlan plan = planFrom(purchase);
            expiresAt = extendExpiration(expiresAt, purchase.getCreatedAt(), plan);
        }
        return expiresAt;
    }

    static LocalDateTime extendExpiration(
            LocalDateTime currentExpiresAt,
            LocalDateTime purchaseTime,
            PremiumPlan plan
    ) {
        LocalDateTime base = isActive(currentExpiresAt, purchaseTime) ? currentExpiresAt : purchaseTime;
        return plan == PremiumPlan.YEARLY ? base.plusYears(1) : base.plusMonths(1);
    }

    private PremiumPlan planFrom(Transaction transaction) {
        String description = transaction.getDescription();
        if (description != null && description.toUpperCase(Locale.ROOT).contains(PremiumPlan.YEARLY.name())) {
            return PremiumPlan.YEARLY;
        }
        return PremiumPlan.MONTHLY;
    }

    private PremiumPurchaseResponse response(
            User account,
            boolean active,
            long balance,
            LocalDateTime expiresAt,
            String message
    ) {
        boolean sellerAccount = isSeller(account);
        long monthly = sellerAccount ? SELLER_MONTHLY_PRICE : USER_MONTHLY_PRICE;
        long yearly = sellerAccount ? SELLER_YEARLY_PRICE : USER_YEARLY_PRICE;
        return new PremiumPurchaseResponse(
                active,
                monthly,
                yearly,
                monthly * 12 - yearly,
                balance,
                expiresAt,
                sellerAccount ? "SELLER" : "USER",
                message
        );
    }

    private User findEligibleAccount(Long userId) {
        User user = userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + userId));
        String roleName = user.getRole() == null ? null : user.getRole().getRoleName();
        if (!"Seller".equalsIgnoreCase(roleName) && !"User".equalsIgnoreCase(roleName)) {
            throw new AccessDeniedException("Chỉ tài khoản User hoặc Seller mới có thể đăng ký Premium");
        }
        return user;
    }

    private static boolean isSeller(User user) {
        return user.getRole() != null
                && "Seller".equalsIgnoreCase(user.getRole().getRoleName());
    }

    private static long priceFor(PremiumPlan plan, boolean sellerAccount) {
        if (sellerAccount) {
            return plan == PremiumPlan.YEARLY ? SELLER_YEARLY_PRICE : SELLER_MONTHLY_PRICE;
        }
        return plan == PremiumPlan.YEARLY ? USER_YEARLY_PRICE : USER_MONTHLY_PRICE;
    }

    /** Returns the platform admin wallet (first Admin user), creating it if missing. */
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

    private static long availableBalance(Wallet wallet) {
        return Math.max(0L, safeAmount(wallet.getBalance()) - safeAmount(wallet.getHoldBalance()));
    }

    private static long safeAmount(Long amount) {
        return amount == null ? 0L : amount;
    }

    private static boolean isActive(LocalDateTime expiresAt, LocalDateTime at) {
        return expiresAt != null && expiresAt.isAfter(at);
    }
}
