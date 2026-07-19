package com.auction.premium.service;

import com.auction.account.dao.UserRepository;
import com.auction.account.entity.User;
import com.auction.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class PremiumAccessService {
    private final UserRepository userRepository;
    public User requirePremium(Long userId) {
        User user = userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (!user.hasActivePremium()) throw new AccessDeniedException("Tính năng này yêu cầu gói Premium còn hạn");
        return user;
    }
}
