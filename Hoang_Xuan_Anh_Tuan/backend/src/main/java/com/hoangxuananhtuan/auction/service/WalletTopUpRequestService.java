package com.hoangxuananhtuan.auction.service;

import com.hoangxuananhtuan.auction.dto.WalletTopUpRequestCreateRequest;
import com.hoangxuananhtuan.auction.dto.WalletTopUpRequestResponse;

import java.util.List;

public interface WalletTopUpRequestService {
    WalletTopUpRequestResponse createTopUpRequest(WalletTopUpRequestCreateRequest request);
    List<WalletTopUpRequestResponse> getMyTopUpRequests(Long userId);
    List<WalletTopUpRequestResponse> getPendingTopUpRequests();
    WalletTopUpRequestResponse approveTopUpRequest(Long requestId, Long reviewerId);
    WalletTopUpRequestResponse rejectTopUpRequest(Long requestId, Long reviewerId);
}
