package com.hoangxuananhtuan.auction.repository;

import com.hoangxuananhtuan.auction.domain.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}


