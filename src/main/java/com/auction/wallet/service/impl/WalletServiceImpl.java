package com.auction.wallet.service.impl;

import com.auction.common.exception.ResourceNotFoundException;
import com.auction.wallet.dto.WalletResponse;
import com.auction.wallet.entity.Wallet;
import com.auction.wallet.repository.WalletRepository;
import com.auction.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;

    @Override
    public WalletResponse getWalletByUserId(Long userId) {
        Wallet wallet = walletRepository.findByUser_Id(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user: " + userId));

        return WalletResponse.builder()
                .walletId(wallet.getWalletId())
                .userId(wallet.getUser().getUserId())
                .balance(wallet.getBalance())
                .holdBalance(wallet.getHoldBalance())
                .status("ACTIVE")
                .build();
    }
}


