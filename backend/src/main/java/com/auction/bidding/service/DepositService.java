package com.auction.bidding.service;

import com.auction.bidding.dto.DepositResponse;

public interface DepositService {
    DepositResponse createDeposit(Long auctionId, Long userId);
}

