package com.auction.product.service;

import com.auction.account.dao.UserRepository;
import com.auction.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AiValuationQuotaService {

    private final UserRepository userRepository;

    @Value("${ai.valuation.free-limit:12}")
    private int freeLimit;

    public int getLimit() {
        return freeLimit;
    }

    @Transactional(readOnly = true)
    public int getRemaining(int userId) {
        int used = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại: " + userId))
                .getAiValuationUsedCount();
        return Math.max(0, freeLimit - used);
    }

    /** Consumes one use if quota remains. {@link ConsumeResult#allowed()} is false if it was already exhausted. */
    @Transactional
    public ConsumeResult consume(int userId) {
        boolean allowed = userRepository.incrementAiValuationUsage(userId, freeLimit) > 0;
        return new ConsumeResult(allowed, getRemaining(userId));
    }

    public record ConsumeResult(boolean allowed, int remaining) {
    }
}
