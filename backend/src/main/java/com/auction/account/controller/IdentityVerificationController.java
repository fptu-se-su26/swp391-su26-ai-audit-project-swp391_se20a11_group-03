package com.auction.account.controller;

import com.auction.account.dao.UserDAO;
import com.auction.account.entity.User;
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
public class IdentityVerificationController {
    private final UserDAO userDAO;

    @PostMapping("/identity-verification")
    public String verifyIdentity(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        User currentUser = session == null ? null : (User) session.getAttribute("currentUser");
        if (currentUser == null) {
            return "redirect:/login";
        }

        currentUser.setIdentityVerified(true);
        currentUser.setIdentityVerifiedAt(LocalDateTime.now());
        currentUser.setVerificationLevel((byte) Math.max(currentUser.getVerificationLevel(), 2));
        currentUser.setProfileStatus("VERIFIED");
        userDAO.update(currentUser);
        session.setAttribute("currentUser", currentUser);
        return "redirect:/profile?identity_verified=1";
    }
}



