package com.auction.account.service;

import com.auction.common.service.MailService;

import com.auction.account.entity.User;
import com.auction.common.util.TokenUtil;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {
    private final ProfileService profileService;
    private final MailService mailService;

    public String createAndSendToken(User user, String verifyBaseUrl, int validMinutes) {
        if (user == null) {
            throw new IllegalArgumentException("User must not be null");
        }
        String rawToken = TokenUtil.generateToken(32);
        profileService.createEmailVerificationToken(user, TokenUtil.sha256(rawToken), validMinutes);
        String verifyUrl = verifyBaseUrl + "?token=" + rawToken;
        mailService.sendVerificationEmail(user.getEmail(), user.getFullName(), verifyUrl);
        return rawToken;
    }

    public boolean verifyToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return false;
        }
        return profileService.verifyEmailToken(TokenUtil.sha256(rawToken.trim()));
    }
}


