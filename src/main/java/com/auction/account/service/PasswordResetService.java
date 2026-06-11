package com.auction.account.service;

import com.auction.common.service.MailService;

import com.auction.account.dao.PasswordResetTokenDAO;
import com.auction.account.dao.UserDAO;
import com.auction.account.entity.PasswordResetToken;
import com.auction.account.entity.User;
import com.auction.common.util.TokenUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
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


