package com.hoangxuananhtuan.auction.service;

import com.hoangxuananhtuan.auction.dto.WalletResponse;

public interface WalletService {
    WalletResponse getWalletByUserId(Long userId);
}
