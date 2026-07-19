package com.hoangxuananhtuan.auction.service;

import com.hoangxuananhtuan.auction.dto.WithdrawalRequestCreateRequest;
import com.hoangxuananhtuan.auction.dto.WithdrawalRequestResponse;

import java.util.List;

public interface WithdrawalRequestService {
    WithdrawalRequestResponse createWithdrawalRequest(WithdrawalRequestCreateRequest request);
    List<WithdrawalRequestResponse> getMyWithdrawalRequests(Long userId);
    List<WithdrawalRequestResponse> getPendingWithdrawalRequests();
    WithdrawalRequestResponse approveWithdrawalRequest(Long requestId, Long reviewerId);
    WithdrawalRequestResponse rejectWithdrawalRequest(Long requestId, Long reviewerId);
}
