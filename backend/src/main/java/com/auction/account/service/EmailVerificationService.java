package com.auction.account.service;

import com.auction.common.service.MailService;

import com.auction.account.entity.User;
import com.auction.common.util.TokenUtil;
import org.springframework.stereotype.Service;

@Service
public class EmailVerificationService {
    private final ProfileService profileService = new ProfileService();
    private final MailService mailService = new MailService();

    public String createAndSendToken(User user, String verifyBaseUrl, int validMinutes) {
        if (user == null) {
            throw new IllegalArgumentException("User must not be null");
        }
        String rawToken = TokenUtil.generateToken(32);
        profileService.createEmailVerificationToken(user, TokenUtil.sha256(rawToken), validMinutes);
        String verifyUrl = verifyBaseUrl + "?token=" + rawToken;
        mailService.sendVerificationEmail(user.getEmail(), verifyUrl);
        return rawToken;
    }
}


