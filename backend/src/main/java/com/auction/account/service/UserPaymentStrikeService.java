package com.auction.account.service;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.notification.entity.Notification;
import com.auction.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserPaymentStrikeService {

    public static final int MAX_STRIKES = 3;
    public static final int ADMIN_UNLOCK_STRIKE_COUNT = 2;

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void recordForfeit(User winner, Long auctionId) {
        if (winner == null) {
            return;
        }
        User user = userRepository.findById(winner.getId()).orElse(null);
        if (user == null) {
            return;
        }
        if (user.getPaymentStrikeCount() >= MAX_STRIKES && user.isLockedByPaymentStrikes()) {
            return;
        }

        int newCount = Math.min(MAX_STRIKES, user.getPaymentStrikeCount() + 1);
        user.setPaymentStrikeCount(newCount);
        userRepository.save(user);

        notificationService.createNotification(
                user.getUserId(),
                "Vi phạm thanh toán đấu giá",
                String.format(
                        "Bạn đã bị ghi nhận %d/%d lần không thanh toán sau khi thắng đấu giá. "
                                + "Đủ %d lần tài khoản sẽ bị khóa tự động.",
                        newCount,
                        MAX_STRIKES,
                        MAX_STRIKES),
                Notification.NotificationType.PAYMENT_REQUIRED,
                auctionId,
                "PAYMENT_STRIKE"
        );

        if (newCount >= MAX_STRIKES) {
            lockForStrikes(user);
            notifyAdmins(user, auctionId);
        }
    }

    @Transactional
    public void recordSuccessfulPayment(User buyer, Long auctionId) {
        if (buyer == null) {
            return;
        }
        User user = userRepository.findById(buyer.getId()).orElse(null);
        if (user == null) {
            return;
        }

        boolean hadStrikes = user.getPaymentStrikeCount() > 0;
        boolean wasStrikeLocked = user.isLockedByPaymentStrikes();

        if (hadStrikes) {
            user.setPaymentStrikeCount(Math.max(0, user.getPaymentStrikeCount() - 1));
        }

        if (wasStrikeLocked && user.getPaymentStrikeCount() < MAX_STRIKES) {
            user.setActive(true);
            user.setStatus("ACTIVE");
            user.setLockedByPaymentStrikes(false);
        }

        userRepository.save(user);

        if (hadStrikes) {
            notificationService.createNotification(
                    user.getUserId(),
                    "Đã gỡ 1 lượt vi phạm thanh toán",
                    String.format(
                            "Bạn đã thanh toán thành công. Số lượt vi phạm hiện tại: %d/%d.",
                            user.getPaymentStrikeCount(),
                            MAX_STRIKES),
                    Notification.NotificationType.GENERAL,
                    auctionId,
                    "PAYMENT_STRIKE_CLEARED"
            );
        }
    }

    @Transactional
    public void applyAdminUnlock(User user) {
        if (user == null || !user.isLockedByPaymentStrikes()) {
            return;
        }
        user.setPaymentStrikeCount(ADMIN_UNLOCK_STRIKE_COUNT);
        user.setLockedByPaymentStrikes(false);
        user.setActive(true);
        user.setStatus("ACTIVE");
    }

    private void lockForStrikes(User user) {
        user.setActive(false);
        user.setStatus("LOCKED");
        user.setLockedByPaymentStrikes(true);
        userRepository.save(user);

        notificationService.createNotification(
                user.getUserId(),
                "Tài khoản bị khóa",
                String.format(
                        "Tài khoản của bạn đã bị khóa do vi phạm thanh toán %d/%d lần. "
                                + "Vui lòng liên hệ quản trị viên để được hỗ trợ.",
                        user.getPaymentStrikeCount(),
                        MAX_STRIKES),
                Notification.NotificationType.GENERAL,
                user.getUserId(),
                "USER_STRIKE_LOCK"
        );
    }

    private void notifyAdmins(User lockedUser, Long auctionId) {
        String message = String.format(
                "Tài khoản \"%s\" (%s) đã bị khóa tự động do không thanh toán %d/%d lần sau khi thắng đấu giá.",
                lockedUser.getFullName(),
                lockedUser.getEmail(),
                lockedUser.getPaymentStrikeCount(),
                MAX_STRIKES);

        for (User admin : userRepository.findAllByRole_RoleName("Admin")) {
            notificationService.createNotification(
                    admin.getUserId(),
                    "Tài khoản bị khóa do vi phạm thanh toán",
                    message,
                    Notification.NotificationType.GENERAL,
                    lockedUser.getUserId(),
                    "USER_STRIKE_LOCK"
            );
        }
    }
}
