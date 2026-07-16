package com.auction.account.service;

import com.auction.account.entity.User;
import com.auction.common.exception.KycRequiredException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

/**
 * Reads KYC eligibility from both the denormalized user flag and the source
 * KycProfiles row. Requiring both prevents stale flags from authorizing a
 * seller after a KYC resubmission, rejection, or request for more information.
 */
@Service
@RequiredArgsConstructor
public class KycEligibilityService {

    private final JdbcTemplate jdbcTemplate;

    public void requireApproved(User user, String message) {
        if (user == null) {
            throw new KycRequiredException("Tài khoản người bán không tồn tại.");
        }

        if (!isApproved(user)) {
            throw new KycRequiredException(message);
        }
    }

    public boolean isApproved(User user) {
        if (user == null || !user.isIdentityVerified()) {
            return false;
        }

        Integer approvedProfiles = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM KycProfiles WHERE UserId = ? AND Status = 'APPROVED'",
                Integer.class,
                user.getId()
        );
        return approvedProfiles != null && approvedProfiles > 0;
    }
}
