package com.auction.account.dao;

import com.auction.account.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByPhone(String phone);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username) OR LOWER(u.email) = LOWER(:email)")
    Optional<User> findByUsernameOrEmail(@Param("username") String username, @Param("email") String email);

    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username) OR LOWER(u.email) = LOWER(:username)")
    Optional<User> findByUsername(@Param("username") String username);

    Optional<User> findFirstByUsernameIgnoreCase(String username);

    Optional<User> findFirstByRole_RoleNameOrderByIdAsc(String roleName);

    List<User> findAllByRole_RoleName(String roleName);

    /**
     * Atomically bumps AI valuation usage only while under the free limit, so
     * concurrent requests from the same user can't both slip through. Returns
     * the number of rows updated (0 means the quota was already exhausted).
     */
    @Modifying
    @Query("UPDATE User u SET u.aiValuationUsedCount = u.aiValuationUsedCount + 1 " +
            "WHERE u.id = :userId AND u.aiValuationUsedCount < :limit")
    int incrementAiValuationUsage(@Param("userId") int userId, @Param("limit") int limit);
}
