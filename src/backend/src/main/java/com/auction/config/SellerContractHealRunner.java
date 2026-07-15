package com.auction.config;

import com.auction.product.service.ContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Heals verified sellers who acknowledged the platform agreement before persistence
 * was wired to POST /seller-contract/submit (no SELLER_AGREEMENT row in Contracts).
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SellerContractHealRunner implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final ContractService contractService;

    @Override
    public void run(ApplicationArguments args) {
        List<Long> userIds;
        try {
            userIds = jdbcTemplate.queryForList(
                    """
                    SELECT u.UserId
                    FROM Users u
                    INNER JOIN Roles r ON r.RoleId = u.RoleId AND r.RoleName = N'Seller'
                    LEFT JOIN Contracts c
                        ON c.ReferenceId = u.UserId AND c.ContractType = N'SELLER_AGREEMENT'
                    WHERE u.IdentityVerified = TRUE AND c.ContractId IS NULL
                    """,
                    Long.class);
        } catch (DataAccessException ex) {
            log.warn("[SellerContractHeal] Skipped because the database is temporarily unavailable: {}",
                    ex.getMostSpecificCause().getMessage());
            return;
        }
        if (userIds.isEmpty()) {
            return;
        }
        for (Long userId : userIds) {
            try {
                contractService.signSellerContract(userId);
                log.info("[SellerContractHeal] Created missing SELLER_AGREEMENT for userId={}", userId);
            } catch (Exception ex) {
                log.warn("[SellerContractHeal] Failed for userId={}: {}", userId, ex.getMessage());
            }
        }
    }
}
