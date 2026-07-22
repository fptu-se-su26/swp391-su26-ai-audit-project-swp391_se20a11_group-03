package com.auction.wallet.repository;

import com.auction.wallet.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByReferenceCode(String referenceCode);

    List<Transaction> findByWallet_WalletIdOrderByCreatedAtDesc(Long walletId);

    List<Transaction> findByWallet_WalletIdAndTransactionTypeAndStatusOrderByCreatedAtAsc(
            Long walletId,
            String transactionType,
            String status
    );

    @Query("""
            SELECT t FROM Transaction t
            JOIN FETCH t.wallet w
            JOIN FETCH w.user
            WHERE w.walletId = :walletId
            AND t.createdAt >= :from
            AND t.createdAt < :to
            ORDER BY t.createdAt DESC
            """)
    List<Transaction> findWalletTransactions(
            @Param("walletId") Long walletId,
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);

    @Query("""
            SELECT t FROM Transaction t
            JOIN FETCH t.wallet w
            JOIN FETCH w.user u
            WHERE t.createdAt >= :from
            AND t.createdAt < :to
            AND (:userId IS NULL OR u.id = :userId)
            ORDER BY t.createdAt DESC
            """)
    List<Transaction> findAllTransactions(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to,
            @Param("userId") Long userId);
}


