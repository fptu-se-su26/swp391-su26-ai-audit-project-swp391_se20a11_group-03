package com.auction.account.service;

import com.auction.account.dao.IdentityDocumentDAO;
import com.auction.account.dao.UserDAO;
import com.auction.account.dao.UserVerificationTokenDAO;
import com.auction.account.entity.IdentityDocument;
import com.auction.account.entity.User;
import com.auction.account.entity.UserVerificationToken;
import com.auction.account.entity.VerificationStatus;
import com.auction.account.entity.VerificationType;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserDAO userDAO;
    private final UserVerificationTokenDAO tokenDAO;
    private final IdentityDocumentDAO identityDocumentDAO;

    public User getUserById(int userId) {
        return userDAO.findById(userId);
    }

    public void updateUser(User user) {
        userDAO.update(user);
    }

    public String createEmailVerificationToken(User user, String tokenHash, int validMinutes) {
        if (user == null) {
            throw new IllegalArgumentException("User must not be null");
        }
        UserVerificationToken token = new UserVerificationToken(
                user,
                tokenHash,
                VerificationType.EMAIL.name(),
                LocalDateTime.now().plusMinutes(validMinutes),
                LocalDateTime.now()
        );
        tokenDAO.save(token);
        return tokenHash;
    }

    public boolean verifyEmailToken(String tokenHash) {
        UserVerificationToken token = tokenDAO.findByHashAndType(tokenHash, VerificationType.EMAIL.name());
        if (token == null) {
            return false;
        }
        if (token.getUsedAt() != null) {
            return false;
        }
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }
        tokenDAO.markUsed(token.getId(), LocalDateTime.now());
        User user = token.getUser();
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setVerificationLevel((byte) Math.max(user.getVerificationLevel(), 1));
        user.setProfileStatus(user.isIdentityVerified()
                ? VerificationStatus.VERIFIED.name()
                : VerificationStatus.PENDING_IDENTITY_VERIFY.name());
        userDAO.update(user);
        return true;
    }

    public void createIdentityVerificationRecord(IdentityDocument document) {
        if (document == null) {
            throw new IllegalArgumentException("Identity document must not be null");
        }
        identityDocumentDAO.save(document);
    }

    public IdentityDocument getLatestIdentityDocument(long userId) {
        return identityDocumentDAO.findLatestByUserId(userId);
    }

    public void markIdentityVerified(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User must not be null");
        }
        user.setIdentityVerified(true);
        user.setIdentityVerifiedAt(LocalDateTime.now());
        user.setVerificationLevel((byte) Math.max(user.getVerificationLevel(), 2));
        user.setProfileStatus(VerificationStatus.ACTIVE.name());
        userDAO.update(user);
    }

    public VerificationStatus resolveProfileStatus(User user) {
        if (user == null) {
            return VerificationStatus.PENDING_PROFILE;
        }
        if (!user.isEmailVerified()) {
            return VerificationStatus.PENDING_EMAIL_VERIFY;
        }
        if (!user.isIdentityVerified()) {
            return VerificationStatus.PENDING_IDENTITY_VERIFY;
        }
        if (user.isActive()) {
            return VerificationStatus.ACTIVE;
        }
        return VerificationStatus.VERIFIED;
    }
}


