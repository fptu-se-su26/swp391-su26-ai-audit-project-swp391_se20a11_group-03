package com.auction.account.service;

import com.auction.account.dao.PendingEmailVerificationRepository;
import com.auction.account.dao.UserRepository;
import com.auction.account.entity.PendingEmailVerification;
import com.auction.common.service.MailService;
import com.auction.common.util.TokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RegistrationEmailVerificationService {
    private static final int OTP_VALID_MINUTES = 10;
    private static final int TOKEN_VALID_MINUTES = 15;
    private static final int MAX_ATTEMPTS = 5;
    private static final int RESEND_COOLDOWN_SECONDS = 60;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final PendingEmailVerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final MailService mailService;

    @Transactional
    public void sendCode(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new IllegalArgumentException("Email đã được sử dụng.");
        }
        LocalDateTime now = LocalDateTime.now();
        if (verificationRepository.existsByEmailIgnoreCaseAndCreatedAtAfter(
                email,
                now.minusSeconds(RESEND_COOLDOWN_SECONDS)
        )) {
            throw new IllegalArgumentException("Vui lòng chờ 60 giây trước khi gửi lại mã.");
        }

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        String salt = TokenUtil.generateToken(16);
        PendingEmailVerification verification = new PendingEmailVerification();
        verification.setEmail(email);
        verification.setOtpSalt(salt);
        verification.setOtpHash(hashOtp(salt, code));
        verification.setAttemptCount(0);
        verification.setExpiresAt(now.plusMinutes(OTP_VALID_MINUTES));
        verification.setCreatedAt(now);
        verificationRepository.save(verification);
        mailService.sendRegistrationOtpEmail(email, code, OTP_VALID_MINUTES);
    }

    @Transactional
    public String verifyCode(String rawEmail, String code) {
        String email = normalizeEmail(rawEmail);
        PendingEmailVerification verification = verificationRepository
                .findTopByEmailIgnoreCaseAndConsumedAtIsNullOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new IllegalArgumentException("Vui lòng gửi mã xác thực trước."));
        LocalDateTime now = LocalDateTime.now();
        if (verification.getVerifiedAt() != null) {
            throw new IllegalArgumentException("Email đã được xác thực.");
        }
        if (verification.getExpiresAt().isBefore(now)) {
            throw new IllegalArgumentException("Mã xác thực đã hết hạn. Vui lòng gửi mã mới.");
        }
        if (verification.getAttemptCount() >= MAX_ATTEMPTS) {
            throw new IllegalArgumentException("Bạn đã nhập sai quá nhiều lần. Vui lòng gửi mã mới.");
        }

        verification.setAttemptCount(verification.getAttemptCount() + 1);
        String candidateHash = hashOtp(verification.getOtpSalt(), code);
        if (!MessageDigest.isEqual(
                verification.getOtpHash().getBytes(StandardCharsets.UTF_8),
                candidateHash.getBytes(StandardCharsets.UTF_8)
        )) {
            verificationRepository.save(verification);
            throw new IllegalArgumentException("Mã xác thực email không đúng.");
        }

        String registrationToken = TokenUtil.generateToken(32);
        verification.setVerifiedAt(now);
        verification.setRegistrationTokenHash(TokenUtil.sha256(registrationToken));
        verification.setExpiresAt(now.plusMinutes(TOKEN_VALID_MINUTES));
        verificationRepository.save(verification);
        return registrationToken;
    }

    public boolean isVerified(String rawEmail, String rawRegistrationToken) {
        if (rawRegistrationToken == null || rawRegistrationToken.isBlank()) {
            return false;
        }
        String email;
        try {
            email = normalizeEmail(rawEmail);
        } catch (IllegalArgumentException ex) {
            return false;
        }
        return verificationRepository
                .findTopByRegistrationTokenHashAndConsumedAtIsNullOrderByCreatedAtDesc(
                        TokenUtil.sha256(rawRegistrationToken.trim())
                )
                .filter(item -> item.getEmail().equalsIgnoreCase(email))
                .filter(item -> item.getVerifiedAt() != null)
                .filter(item -> item.getExpiresAt().isAfter(LocalDateTime.now()))
                .isPresent();
    }

    @Transactional
    public void consume(String rawRegistrationToken) {
        if (rawRegistrationToken == null || rawRegistrationToken.isBlank()) {
            return;
        }
        verificationRepository
                .findTopByRegistrationTokenHashAndConsumedAtIsNullOrderByCreatedAtDesc(
                        TokenUtil.sha256(rawRegistrationToken.trim())
                )
                .ifPresent(item -> {
                    item.setConsumedAt(LocalDateTime.now());
                    verificationRepository.save(item);
                });
    }

    private String normalizeEmail(String rawEmail) {
        String email = rawEmail == null
                ? ""
                : rawEmail.trim().toLowerCase(Locale.ROOT);
        if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("Email không hợp lệ.");
        }
        return email;
    }

    private String hashOtp(String salt, String code) {
        return TokenUtil.sha256(salt + ":" + code);
    }
}
