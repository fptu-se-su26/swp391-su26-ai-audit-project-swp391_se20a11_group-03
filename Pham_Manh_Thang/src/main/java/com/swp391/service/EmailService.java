package com.swp391.service;

/**
 * @author Pham Manh Thang
 */
public interface EmailService {
    void sendListingContractEmail(String toEmail, Long productId, byte[] pdfAttachment);
    void sendProductRejectionEmail(String toEmail, Long productId, String productName, String rejectionReason);
    void sendProductApprovalEmail(String toEmail, Long productId, String productName);
}
