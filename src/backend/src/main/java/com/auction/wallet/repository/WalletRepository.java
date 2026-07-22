package com.auction.wallet.repository;

import com.auction.wallet.entity.Wallet;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUser_Id(Integer userId);

    /** Row-locked read used whenever a caller is about to mutate balance/holdBalance. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Wallet> findLockedByUser_Id(Integer userId);
}
