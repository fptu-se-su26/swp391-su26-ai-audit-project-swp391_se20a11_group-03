package com.vnec.service;

import com.vnec.dao.IdentityDocumentDAO;
import com.vnec.dao.UserDAO;
import com.vnec.dao.UserVerificationTokenDAO;
import com.vnec.model.IdentityDocument;
import com.vnec.model.User;
import com.vnec.model.UserVerificationToken;
import com.vnec.model.VerificationStatus;
import com.vnec.model.VerificationType;

import java.time.LocalDateTime;

public class ProfileService {
    private final UserDAO userDAO = new UserDAO();
    private final UserVerificationTokenDAO tokenDAO = new UserVerificationTokenDAO();
    private final IdentityDocumentDAO identityDocumentDAO = new IdentityDocumentDAO();

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
        user.setVerificationLevel(Math.max(user.getVerificationLevel(), 1));
        user.setProfileStatus(VerificationStatus.PENDING_IDENTITY_VERIFY.name());
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
        user.setVerificationLevel(Math.max(user.getVerificationLevel(), 2));
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