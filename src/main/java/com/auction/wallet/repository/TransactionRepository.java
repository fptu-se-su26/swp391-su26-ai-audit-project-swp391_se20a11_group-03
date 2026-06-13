package com.auction.wallet.repository;

import com.auction.wallet.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByReferenceCode(String referenceCode);

    List<Transaction> findByWallet_WalletIdOrderByCreatedAtDesc(Long walletId);
}


