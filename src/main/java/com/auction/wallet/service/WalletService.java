package com.auction.wallet.service;

import com.auction.wallet.dto.DepositQrResponse;
import com.auction.wallet.dto.SepayWebhookRequest;
import com.auction.wallet.dto.WalletResponse;
import com.auction.wallet.dto.WithdrawRequest;
import com.auction.wallet.dto.WithdrawalResponse;
import com.auction.wallet.dto.WithdrawalStatusRequest;

import java.util.List;
import java.util.Map;

public interface WalletService {
    WalletResponse getWalletByUserId(Long userId);

    DepositQrResponse createDepositQr(Long userId, Long amount);

    Map<String, Object> handleSepayWebhook(SepayWebhookRequest request);

    WithdrawalResponse createWithdrawal(Long userId, WithdrawRequest request);

    List<WithdrawalResponse> getWithdrawals(String status);

    WithdrawalResponse updateWithdrawalStatus(Long id, WithdrawalStatusRequest request);
}


