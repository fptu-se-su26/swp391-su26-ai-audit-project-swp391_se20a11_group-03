package com.swp391.service;

/**
 * @author Pham Manh Thang
 * TODO: Implement email service with Spring Mail
 */
public interface EmailService {
    void sendListingContractEmail(String toEmail, Long productId, byte[] pdfAttachment);
}

