package com.auction.fraud.service;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserRestrictionService {
    private final UserRepository userRepository;
    private final FraudAuditService fraudAuditService;

    @Transactional
    public void restrictBidding(Long userId, Duration duration, Long alertId) {
        User user = findUser(userId);
        if ("BANNED".equalsIgnoreCase(user.getStatus())
                || "TEMPORARILY_SUSPENDED".equalsIgnoreCase(user.getStatus())) return;
        LocalDateTime until = LocalDateTime.now().plus(duration);
        if (user.getBidRestrictedUntil() == null || user.getBidRestrictedUntil().isBefore(until)) {
            user.setStatus("BID_RESTRICTED");
            user.setBidRestrictedUntil(until);
            user.setSuspensionReason("Automatic fraud restriction; alert " + alertId);
            userRepository.save(user);
            fraudAuditService.record("FRAUD_RESTRICT", null, userId,
                    "Bid restricted until " + until + "; alert " + alertId);
        }
    }

    @Transactional
    public void suspendAccount(Long userId, Long alertId) {
        User user = findUser(userId);
        if ("BANNED".equalsIgnoreCase(user.getStatus())) return;
        user.setStatus("TEMPORARILY_SUSPENDED");
        user.setSuspendedAt(LocalDateTime.now());
        user.setSuspensionReason("Automatic fraud suspension; alert " + alertId);
        userRepository.save(user);
        fraudAuditService.record("FRAUD_SUSPEND", null, userId,
                "Account temporarily suspended; alert " + alertId);
    }

    @Transactional
    public void restore(Long userId, Long adminId, Long alertId) {
        User user = findUser(userId);
        if ("BANNED".equalsIgnoreCase(user.getStatus())) {
            throw new IllegalStateException("A banned account cannot be restored from a fraud alert");
        }
        user.setActive(true);
        user.setStatus("ACTIVE");
        user.setBidRestrictedUntil(null);
        user.setSuspendedAt(null);
        user.setSuspensionReason(null);
        userRepository.save(user);
        fraudAuditService.record("FRAUD_RESTORE", adminId, userId, "Restored from alert " + alertId);
    }

    @Transactional
    public void ban(Long userId, Long adminId, Long alertId) {
        ban(userId, adminId, alertId, "Fraud confirmed by admin");
    }

    @Transactional
    public void ban(Long userId, Long adminId, Long alertId, String reason) {
        User user = findUser(userId);
        if (userId.equals(adminId)) {
            throw new IllegalStateException("An admin cannot ban their own account");
        }
        if (user.getRole() != null && "Admin".equalsIgnoreCase(user.getRole().getRoleName())) {
            throw new IllegalStateException("Admin accounts cannot be banned through fraud automation");
        }
        user.setActive(false);
        user.setStatus("BANNED");
        user.setBidRestrictedUntil(null);
        user.setBannedAt(LocalDateTime.now());
        user.setBannedBy(adminId);
        String detail = reason + (alertId == null ? "" : "; alert " + alertId);
        user.setSuspensionReason(detail);
        userRepository.save(user);
        fraudAuditService.record("FRAUD_BAN", adminId, userId, "Permanent ban confirmed: " + detail);
    }

    private User findUser(Long userId) {
        return userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }
}
