package com.hoangxuananhtuan.auction.service;

import com.hoangxuananhtuan.auction.dto.DepositResponse;

public interface DepositService {
    DepositResponse createDeposit(Long auctionId, Long userId);
}
