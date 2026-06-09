package com.auction.account.service;

import com.auction.account.util.AppConfig;
import jakarta.mail.Authenticator;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Session;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

import java.util.Properties;

public class MailService {
    private final Session session;
    private final String fromAddress;

    public MailService() {
        Properties props = new Properties();
        props.put("mail.smtp.auth", AppConfig.get("vnec.mail.smtp.auth", "true"));
        props.put("mail.smtp.starttls.enable", AppConfig.get("vnec.mail.smtp.starttls", "true"));
        props.put("mail.smtp.host", AppConfig.get("vnec.mail.smtp.host", "smtp.gmail.com"));
        props.put("mail.smtp.port", AppConfig.get("vnec.mail.smtp.port", "587"));
        props.put("mail.smtp.ssl.trust", AppConfig.get("vnec.mail.smtp.host", "smtp.gmail.com"));

        this.fromAddress = AppConfig.get("vnec.mail.from", AppConfig.get("vnec.mail.username", ""));
        String username = AppConfig.get("vnec.mail.username", "");
        String password = AppConfig.get("vnec.mail.password", "");

        this.session = Session.getInstance(props, new Authenticator() {
            @Override
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });
    }

    public void sendVerificationEmail(String to, String verifyUrl) {
        String subject = "Xác minh email cho tài khoản đấu giá";
        String html = buildVerificationEmailHtml(verifyUrl);
        sendHtml(to, subject, html);
    }

    public void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = new MimeMessage(session);
            message.setFrom(new InternetAddress(fromAddress));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
            message.setSubject(subject, "UTF-8");
            message.setContent(html, "text/html; charset=UTF-8");
            Transport.send(message);
        } catch (MessagingException ex) {
            throw new IllegalStateException("Unable to send email", ex);
        }
    }

    private String buildVerificationEmailHtml(String verifyUrl) {
        return "<div style='font-family:Arial,sans-serif;line-height:1.6'>"
                + "<h2>Xác minh email tài khoản đấu giá</h2>"
                + "<p>Vui lòng nhấn vào nút bên dưới để xác minh email của bạn. Link có hiệu lực trong thời gian ngắn.</p>"
                + "<p><a href='" + verifyUrl + "' style='display:inline-block;padding:10px 16px;background:#8f2d2d;color:#fff;text-decoration:none;border-radius:8px'>Xác minh email</a></p>"
                + "<p>Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p>"
                + "</div>";
    }
}


