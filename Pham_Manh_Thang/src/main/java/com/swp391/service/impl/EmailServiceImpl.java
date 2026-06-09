package com.swp391.service.impl;

import com.swp391.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * @author Pham Manh Thang
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:no-reply@example.com}")
    private String fromEmail;

    @Override
    public void sendListingContractEmail(String toEmail, Long productId, byte[] pdfAttachment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Hợp Đồng Ủy Quyền Đăng Sản Phẩm - Submission ID: " + productId);
            helper.setText("Kính gửi quý khách,\n\nĐính kèm là hợp đồng ủy quyền đăng sản phẩm của quý khách.\n\nTrân trọng,\nĐội ngũ hỗ trợ");

            ByteArrayResource attachment = new ByteArrayResource(pdfAttachment);
            helper.addAttachment("hop-dong-uy-quyen-" + productId + ".pdf", attachment);

            mailSender.send(message);
            log.info("Successfully sent listing contract email to {} for submission ID {}", toEmail, productId);
        } catch (MessagingException e) {
            log.error("Failed to send listing contract email to {} for submission ID {}", toEmail, productId, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendProductRejectionEmail(String toEmail, Long productId, String productName, String rejectionReason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Sản phẩm của bạn đã bị từ chối - Submission ID: " + productId);
            helper.setText("Kính gửi quý khách,\n\nSản phẩm \"" + productName + "\" (Submission ID: " + productId + ") của bạn đã bị từ chối.\n\nLí do từ chối: " + (rejectionReason != null ? rejectionReason : "Không có lí do cụ thể") + "\n\nTrân trọng,\nĐội ngũ hỗ trợ");

            mailSender.send(message);
            log.info("Successfully sent product rejection email to {} for submission ID {}", toEmail, productId);
        } catch (MessagingException e) {
            log.error("Failed to send product rejection email to {} for submission ID {}", toEmail, productId, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Override
    public void sendProductApprovalEmail(String toEmail, Long productId, String productName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Sản phẩm của bạn đã được chấp nhận - Submission ID: " + productId);
            helper.setText("Kính gửi quý khách,\n\nSản phẩm \"" + productName + "\" (Submission ID: " + productId + ") của bạn đã được chấp thuận và sẽ sớm được đưa lên sàn đấu giá.\n\nTrân trọng,\nĐội ngũ hỗ trợ");

            mailSender.send(message);
            log.info("Successfully sent product approval email to {} for submission ID {}", toEmail, productId);
        } catch (MessagingException e) {
            log.error("Failed to send product approval email to {} for submission ID {}", toEmail, productId, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }
}
