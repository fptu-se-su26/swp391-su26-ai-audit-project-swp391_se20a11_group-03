package com.vnec.service;

import com.vnec.dao.PasswordResetTokenDAO;
import com.vnec.dao.UserDAO;
import com.vnec.model.PasswordResetToken;
import com.vnec.model.User;
import com.vnec.util.TokenUtil;

import java.time.LocalDateTime;

public class PasswordResetService {
    private final UserDAO userDAO = new UserDAO();
    private final PasswordResetTokenDAO tokenDAO = new PasswordResetTokenDAO();
    private final MailService mailService = new MailService();

    public boolean requestReset(String loginId, String resetBaseUrl, int validMinutes) {
        if (loginId == null || loginId.trim().isEmpty()) {
            return false;
        }
        User user = userDAO.findByLoginId(loginId.trim());
        if (user == null) {
            return false;
        }
        String rawToken = TokenUtil.generateToken(32);
        String hash = TokenUtil.sha256(rawToken);
        PasswordResetToken token = new PasswordResetToken(user, hash, LocalDateTime.now().plusMinutes(validMinutes), LocalDateTime.now());
        tokenDAO.save(token);
        String resetUrl = resetBaseUrl + "?token=" + rawToken;
        mailService.sendHtml(user.getEmail(), "Đặt lại mật khẩu", "<p>Nhấn vào link để đặt lại mật khẩu:</p><a href='" + resetUrl + "'>Reset password</a>");
        return true;
    }
}