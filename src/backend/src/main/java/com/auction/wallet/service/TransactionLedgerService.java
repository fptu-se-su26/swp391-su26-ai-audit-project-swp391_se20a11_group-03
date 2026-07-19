package com.auction.wallet.service;

import com.auction.wallet.dto.WalletTransactionDTO;

import java.time.LocalDate;
import java.util.List;

public interface TransactionLedgerService {

    List<WalletTransactionDTO> getUserTransactions(Long userId, LocalDate from, LocalDate to, String type);

    List<WalletTransactionDTO> getAdminLedger(LocalDate from, LocalDate to, Long userId, String type);
}
