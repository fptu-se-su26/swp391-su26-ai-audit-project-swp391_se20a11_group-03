package com.auction.common.util;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.common.exception.KycRequiredException;

/**
 * Helper that enforces KYC verification before sensitive actions
 * (placing bids, creating products, creating deposits).
 *
 * <p>Looks up the user fresh from the DB to avoid stale in-memory state
 * after a KYC approval.
 */
public final class KycGuard {

    private KycGuard() {}

    /**
     * Throws {@link KycRequiredException} if the user is not yet identity-verified.
     *
     * @param userId authenticated user id (from {@code @AuthenticationPrincipal})
     * @param userRepository repository to look up current verification state
     * @return the loaded user (so callers can avoid an extra DB round-trip)
     */
    public static User requireVerified(Integer userId, UserRepository userRepository) {
        if (userId == null) {
            throw new KycRequiredException("Vui lòng đăng nhập để tiếp tục.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new KycRequiredException("Tài khoản không tồn tại."));
        if (!user.isIdentityVerified()) {
            throw new KycRequiredException(
                    "Bạn cần hoàn tất xác thực danh tính (KYC) trước khi thực hiện thao tác này.");
        }
        return user;
    }
}
