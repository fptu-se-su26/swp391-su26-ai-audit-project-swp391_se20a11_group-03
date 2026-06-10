package com.auction.wallet.service;

import com.auction.wallet.dto.WalletResponse;

public interface WalletService {
    WalletResponse getWalletByUserId(Long userId);
}


