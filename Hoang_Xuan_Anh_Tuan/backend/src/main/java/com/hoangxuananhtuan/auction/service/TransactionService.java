package com.hoangxuananhtuan.auction.service;

import com.hoangxuananhtuan.auction.dto.TransactionResponse;

import java.util.List;

public interface TransactionService {
    List<TransactionResponse> getWalletTransactions(Long userId);
}
