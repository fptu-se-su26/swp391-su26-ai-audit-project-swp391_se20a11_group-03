package com.auction.common.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Properties;

@Service
public class MailService {
    private final Session session;
    private final String fromAddress;

    public MailService(
            @Value("${vnec.mail.smtp.auth:true}") String smtpAuth,
            @Value("${vnec.mail.smtp.starttls:true}") String startTls,
            @Value("${vnec.mail.smtp.host:smtp.gmail.com}") String smtpHost,
            @Value("${vnec.mail.smtp.port:587}") String smtpPort,
            @Value("${vnec.mail.username:}") String username,
            @Value("${vnec.mail.password:}") String password,
            @Value("${vnec.mail.from:}") String configuredFrom
    ) {
        Properties props = new Properties();
        props.put("mail.smtp.auth", smtpAuth);
        props.put("mail.smtp.starttls.enable", startTls);
        props.put("mail.smtp.host", smtpHost);
        props.put("mail.smtp.port", smtpPort);
        props.put("mail.smtp.ssl.trust", smtpHost);

        this.fromAddress = configuredFrom == null || configuredFrom.isBlank()
                ? username
                : configuredFrom;

        this.session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });
    }

    public void sendVerificationEmail(String to, String recipientName, String verifyUrl) {
        String subject = "Kích hoạt tài khoản BidZone của bạn";
        String html = buildVerificationEmailHtml(recipientName, verifyUrl);
        sendHtml(to, subject, html);
    }

    public void sendRegistrationOtpEmail(String to, String code, int validMinutes) {
        String subject = "Mã xác thực đăng ký BidZone";
        String html = "<div style='font-family:Arial,sans-serif;line-height:1.6;color:#171717'>"
                + "<h2>Xác thực email đăng ký</h2>"
                + "<p>Mã xác thực của bạn là:</p>"
                + "<p style='font-size:28px;font-weight:700;letter-spacing:8px;color:#b98232'>"
                + code
                + "</p>"
                + "<p>Mã có hiệu lực trong " + validMinutes + " phút và chỉ dùng được một lần.</p>"
                + "<p>Nếu bạn không yêu cầu đăng ký BidZone, hãy bỏ qua email này.</p>"
                + "</div>";
        sendHtml(to, subject, html);
    }

    public void sendHtml(String to, String subject, String html) {
        if (fromAddress == null || fromAddress.isBlank()) {
            throw new IllegalStateException(
                    "Email service is not configured. Set MAIL_USERNAME, MAIL_PASSWORD and MAIL_FROM.");
        }
        try {
            MimeMessage message = new MimeMessage(session);
            // Display name "BidZone" thay vì địa chỉ Gmail trần — chuyên nghiệp hơn
            // trong hộp thư và giảm khả năng bị đánh dấu spam.
            message.setFrom(new InternetAddress(fromAddress, "BidZone", "UTF-8"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject, "UTF-8");
            message.setContent(html, "text/html; charset=UTF-8");
            Transport.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException ex) {
            throw new IllegalStateException("Unable to send email", ex);
        }
    }

    private String buildVerificationEmailHtml(String recipientName, String verifyUrl) {
        String safeName = recipientName == null || recipientName.isBlank() ? "bạn" : recipientName;
        return ""
                + "<!DOCTYPE html>"
                + "<html lang='vi'><head><meta charset='UTF-8'>"
                + "<meta name='viewport' content='width=device-width,initial-scale=1'></head>"
                + "<body style='margin:0;padding:0;background-color:#f4f4f5;'>"
                // Preheader: hidden line shown next to the subject in inbox previews.
                + "<div style='display:none;max-height:0;overflow:hidden;'>"
                + "Nhấn vào liên kết để kích hoạt tài khoản BidZone của bạn. Liên kết có hiệu lực trong 30 phút."
                + "</div>"
                + "<table role='presentation' width='100%' cellpadding='0' cellspacing='0' style='background-color:#f4f4f5;padding:32px 12px;'>"
                + "<tr><td align='center'>"
                + "<table role='presentation' width='560' cellpadding='0' cellspacing='0' "
                + "style='max-width:560px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;"
                + "font-family:Arial,Helvetica,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.06);'>"
                // Header
                + "<tr><td style='background-color:#111111;padding:28px 40px;text-align:center;'>"
                + "<span style='font-size:26px;font-weight:bold;letter-spacing:2px;color:#f0c982;'>BID<span style='color:#ffffff;'>ZONE</span></span>"
                + "<p style='margin:6px 0 0;font-size:11px;letter-spacing:3px;color:#9ca3af;'>LUXURY AUCTION HOUSE</p>"
                + "</td></tr>"
                // Body
                + "<tr><td style='padding:36px 40px 8px;'>"
                + "<h1 style='margin:0 0 16px;font-size:20px;color:#111111;'>Xin chào " + escapeHtml(safeName) + ",</h1>"
                + "<p style='margin:0 0 12px;font-size:14px;line-height:1.7;color:#374151;'>"
                + "Cảm ơn bạn đã đăng ký tài khoản tại <b>BidZone</b> — sàn đấu giá trực tuyến các sản phẩm cao cấp. "
                + "Để hoàn tất đăng ký và bắt đầu tham gia đấu giá, vui lòng xác minh địa chỉ email của bạn bằng cách nhấn nút bên dưới:"
                + "</p>"
                + "</td></tr>"
                // CTA button
                + "<tr><td style='padding:16px 40px 8px;' align='center'>"
                + "<a href='" + verifyUrl + "' "
                + "style='display:inline-block;padding:14px 44px;background-color:#c9a35c;color:#111111;"
                + "font-size:15px;font-weight:bold;text-decoration:none;border-radius:999px;'>"
                + "Kích hoạt tài khoản</a>"
                + "<p style='margin:14px 0 0;font-size:12px;color:#6b7280;'>Liên kết có hiệu lực trong <b>30 phút</b> và chỉ dùng được một lần.</p>"
                + "</td></tr>"
                // Security note
                + "<tr><td style='padding:24px 40px 32px;'>"
                + "<table role='presentation' width='100%' cellpadding='0' cellspacing='0'>"
                + "<tr><td style='border-top:1px solid #e5e7eb;padding-top:20px;'>"
                + "<p style='margin:0;font-size:12px;line-height:1.7;color:#6b7280;'>"
                + "Bạn nhận được email này vì địa chỉ email đã được dùng để đăng ký tài khoản BidZone. "
                + "Nếu không phải bạn thực hiện, hãy bỏ qua email này — tài khoản sẽ không được kích hoạt. "
                + "BidZone không bao giờ yêu cầu bạn cung cấp mật khẩu qua email."
                + "</p>"
                + "</td></tr></table>"
                + "</td></tr>"
                // Footer
                + "<tr><td style='background-color:#f9fafb;padding:20px 40px;text-align:center;'>"
                + "<p style='margin:0 0 4px;font-size:12px;font-weight:bold;color:#374151;'>BidZone — Nơi giá trị được tôn vinh</p>"
                + "<p style='margin:0;font-size:11px;color:#9ca3af;'>Email hỗ trợ: " + escapeHtml(fromAddress) + "</p>"
                + "<p style='margin:8px 0 0;font-size:11px;color:#9ca3af;'>&copy; 2026 BidZone. All rights reserved.</p>"
                + "</td></tr>"
                + "</table>"
                + "</td></tr></table>"
                + "</body></html>";
    }

    private String escapeHtml(String value) {
        return value == null ? "" : value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
