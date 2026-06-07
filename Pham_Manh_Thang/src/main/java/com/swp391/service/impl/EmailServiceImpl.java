package com.swp391.service.impl;

import com.swp391.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * @author Pham Manh Thang
 * TODO: Implement with Spring Mail
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendListingContractEmail(String toEmail, Long productId, byte[] pdfAttachment) {
        // TODO: Implement actual email sending
        log.info("Sending listing contract email to {} for product ID {}", toEmail, productId);
    }
}
