package com.vnec.servlet;

import com.vnec.model.User;
import com.vnec.service.IdentityVerificationService;
import com.vnec.service.IdentityVerificationService.VerificationDecision;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.Part;

import java.io.IOException;
import java.io.InputStream;

@MultipartConfig(maxFileSize = 10 * 1024 * 1024, maxRequestSize = 20 * 1024 * 1024)
public class IdentityVerificationServlet extends HttpServlet {

    private final IdentityVerificationService verificationService = new IdentityVerificationService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        User currentUser = session == null ? null : (User) session.getAttribute("currentUser");
        if (currentUser == null) {
            response.sendRedirect(request.getContextPath() + "/login.jsp");
            return;
        }

        // Đã xác minh rồi thì không cần làm lại
        if (currentUser.isIdentityVerified()) {
            response.sendRedirect(request.getContextPath() + "/profile?identity_verified=1");
            return;
        }

        Part frontPart = request.getPart("front_image");
        Part backPart  = request.getPart("back_image");

        if (frontPart == null || frontPart.getSize() == 0
                || backPart == null || backPart.getSize() == 0) {
            request.setAttribute("errorMessage", "Vui lòng tải lên cả mặt trước và mặt sau CCCD.");
            request.getRequestDispatcher("/profile.jsp").forward(request, response);
            return;
        }

        byte[] frontBytes = readBytes(frontPart);
        byte[] backBytes  = readBytes(backPart);

        String frontFileName = getFileName(frontPart);
        String backFileName  = getFileName(backPart);

        VerificationDecision decision = verificationService.submitDocument(
                currentUser,
                "CCCD",
                currentUser.getIdentityNumber(),
                currentUser.getFullName(),
                null,
                frontBytes,
                backBytes,
                frontFileName,
                backFileName
        );

        // Reload user từ DB để session có trạng thái mới nhất
        User refreshed = verificationService.getRefreshedUser(currentUser.getId());
        session.setAttribute("currentUser", refreshed != null ? refreshed : currentUser);

        if (decision.approved()) {
            response.sendRedirect(request.getContextPath() + "/profile?identity_verified=1");
        } else {
            response.sendRedirect(request.getContextPath() + "/profile?identity_pending=1");
        }
    }

    private byte[] readBytes(Part part) throws IOException {
        try (InputStream is = part.getInputStream()) {
            return is.readAllBytes();
        }
    }

    private String getFileName(Part part) {
        String cd = part.getHeader("content-disposition");
        if (cd == null) return "upload";
        for (String token : cd.split(";")) {
            String t = token.trim();
            if (t.startsWith("filename")) {
                return t.substring(t.indexOf('=') + 1).trim().replace("\"", "");
            }
        }
        return "upload";
    }
}
