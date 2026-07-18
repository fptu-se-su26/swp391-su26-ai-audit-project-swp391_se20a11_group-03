package com.auction.account;

import com.auction.account.dao.PendingEmailVerificationRepository;
import com.auction.account.dao.UserRepository;
import com.auction.account.entity.PendingEmailVerification;
import com.auction.account.service.RegistrationEmailVerificationService;
import com.auction.common.service.MailService;
import com.auction.common.util.TokenUtil;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RegistrationEmailVerificationServiceTest {

    @Test
    void verifiesEmailAndConsumesOneTimeRegistrationToken() {
        PendingEmailVerificationRepository verificationRepository =
                mock(PendingEmailVerificationRepository.class);
        UserRepository userRepository = mock(UserRepository.class);
        MailService mailService = mock(MailService.class);
        RegistrationEmailVerificationService service =
                new RegistrationEmailVerificationService(
                        verificationRepository,
                        userRepository,
                        mailService
                );

        AtomicReference<PendingEmailVerification> savedVerification = new AtomicReference<>();
        AtomicReference<String> deliveredCode = new AtomicReference<>();
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(Optional.empty());
        when(verificationRepository.existsByEmailIgnoreCaseAndCreatedAtAfter(anyString(), any()))
                .thenReturn(false);
        when(verificationRepository.save(any(PendingEmailVerification.class)))
                .thenAnswer(invocation -> {
                    PendingEmailVerification value = invocation.getArgument(0);
                    savedVerification.set(value);
                    return value;
                });
        doAnswer(invocation -> {
            deliveredCode.set(invocation.getArgument(1));
            return null;
        }).when(mailService).sendRegistrationOtpEmail(anyString(), anyString(), anyInt());

        service.sendCode("  USER@Example.com ");
        PendingEmailVerification pending = savedVerification.get();
        assertNotNull(pending);
        assertNotNull(deliveredCode.get());

        when(verificationRepository
                .findTopByEmailIgnoreCaseAndConsumedAtIsNullOrderByCreatedAtDesc("user@example.com"))
                .thenReturn(Optional.of(pending));

        String registrationToken =
                service.verifyCode("user@example.com", deliveredCode.get());
        assertNotNull(registrationToken);

        when(verificationRepository
                .findTopByRegistrationTokenHashAndConsumedAtIsNullOrderByCreatedAtDesc(
                        TokenUtil.sha256(registrationToken)
                ))
                .thenReturn(Optional.of(pending));

        assertTrue(service.isVerified("user@example.com", registrationToken));
        service.consume(registrationToken);
        assertNotNull(pending.getConsumedAt());
    }

    @Test
    void rejectsMissingOrInvalidRegistrationToken() {
        RegistrationEmailVerificationService service =
                new RegistrationEmailVerificationService(
                        mock(PendingEmailVerificationRepository.class),
                        mock(UserRepository.class),
                        mock(MailService.class)
                );

        assertFalse(service.isVerified("not-an-email", "token"));
        assertFalse(service.isVerified("user@example.com", ""));
    }
}
