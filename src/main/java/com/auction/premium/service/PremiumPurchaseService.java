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

@Service
@RequiredArgsConstructor
public class PremiumPurchaseService {
    public static final long SELLER_MONTHLY_PRICE = 30_000_000L;
    public static final long SELLER_YEARLY_PRICE = 300_000_000L;
    public static final long USER_MONTHLY_PRICE = 10_000_000L;
    public static final long USER_YEARLY_PRICE = 100_000_000L;

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    @Transactional(readOnly = true)
    public PremiumPurchaseResponse status(Long userId) {
        User user = findEligibleAccount(userId);
        long balance = walletRepository.findByUser_Id(Math.toIntExact(userId))
                .map(w -> w.getBalance() == null ? 0L : w.getBalance()).orElse(0L);
        boolean active = user.hasActivePremium();
        return response(user, active, balance, user.getPremiumExpiresAt(),
                active ? "Tài khoản Premium đang hoạt động" : "Có thể đăng ký Premium");
    }

    @Transactional
    public PremiumPurchaseResponse purchase(Long userId, PremiumPlan plan) {
        Wallet wallet = walletRepository.findByUserIdForUpdate(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));
        User account = findEligibleAccount(userId);
        if (plan == null) throw new BusinessException("Vui lòng chọn chu kỳ Premium");
        boolean sellerAccount = isSeller(account);
        long monthlyPrice = sellerAccount ? SELLER_MONTHLY_PRICE : USER_MONTHLY_PRICE;
        long yearlyPrice = sellerAccount ? SELLER_YEARLY_PRICE : USER_YEARLY_PRICE;
        long price = plan == PremiumPlan.YEARLY ? yearlyPrice : monthlyPrice;
        long balance = wallet.getBalance() == null ? 0L : wallet.getBalance();
        if (balance < price) throw new BusinessException("Số dư ví không đủ để gia hạn gói Premium đã chọn");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime base = account.hasActivePremium() ? account.getPremiumExpiresAt() : now;
        LocalDateTime expiresAt = plan == PremiumPlan.YEARLY ? base.plusYears(1) : base.plusMonths(1);
        wallet.setBalance(balance - price);
        wallet.setUpdatedAt(now);
        account.setPremium(true);
        account.setPremiumExpiresAt(expiresAt);
        walletRepository.save(wallet);
        userRepository.save(account);
        transactionRepository.save(new Transaction(wallet, price, "PREMIUM_PURCHASE", "COMPLETED",
                "PREMIUM-" + userId + "-" + System.currentTimeMillis(),
                "Premium " + plan.name() + " subscription", now));
        return response(account, true, wallet.getBalance(), expiresAt, "Gia hạn Premium thành công");
    }

    private PremiumPurchaseResponse response(User account, boolean active, long balance,
                                             LocalDateTime expiresAt, String message) {
        boolean sellerAccount = isSeller(account);
        long monthly = sellerAccount ? SELLER_MONTHLY_PRICE : USER_MONTHLY_PRICE;
        long yearly = sellerAccount ? SELLER_YEARLY_PRICE : USER_YEARLY_PRICE;
        return new PremiumPurchaseResponse(active, monthly, yearly, monthly * 12 - yearly,
                balance, expiresAt, sellerAccount ? "SELLER" : "USER", message);
    }

    private User findEligibleAccount(Long userId) {
        User user = userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        String roleName = user.getRole() == null ? null : user.getRole().getRoleName();
        if (!"Seller".equalsIgnoreCase(roleName) && !"User".equalsIgnoreCase(roleName))
            throw new AccessDeniedException("Chỉ tài khoản User hoặc Seller mới có thể đăng ký Premium");
        return user;
    }

    private boolean isSeller(User user) {
        return user.getRole() != null && "Seller".equalsIgnoreCase(user.getRole().getRoleName());
    }
}
