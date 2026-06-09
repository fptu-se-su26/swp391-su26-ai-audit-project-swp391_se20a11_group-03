package com.auction.account.controller;

import com.auction.account.dao.UserDAO;
import com.auction.account.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.time.LocalDateTime;

@Controller
@RequestMapping
@RequiredArgsConstructor
public class EmailVerificationController {
    private final UserDAO userDAO;

    @PostMapping("/email-verification")
    public String verifyEmail(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        User currentUser = session == null ? null : (User) session.getAttribute("currentUser");
        if (currentUser == null) {
            return "redirect:/login";
        }

        currentUser.setEmailVerified(true);
        currentUser.setEmailVerifiedAt(LocalDateTime.now());
        currentUser.setVerificationLevel((byte) Math.max(currentUser.getVerificationLevel(), 1));
        updateProfileStatus(currentUser);
        userDAO.update(currentUser);
        session.setAttribute("currentUser", currentUser);
        return "redirect:/profile?email_verified=1";
    }

    private void updateProfileStatus(User user) {
        if (user.isEmailVerified() && user.isIdentityVerified()) {
            user.setProfileStatus("VERIFIED");
        } else if (user.isEmailVerified()) {
            user.setProfileStatus("EMAIL_VERIFIED");
        }
    }
}



