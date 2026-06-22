package com.vnec.service;

import com.vnec.model.IdentityDocument;
import com.vnec.model.User;
import com.vnec.model.VerificationStatus;
import com.vnec.util.AppConfig;

public class IdentityVerificationService {
    private final ProfileService profileService = new ProfileService();
    private final OcrService ocrService = new OcrService();

    public VerificationDecision submitDocument(User user,
                                               String documentType,
                                               String documentNumber,
                                               String fullName,
                                               java.time.LocalDate dateOfBirth,
                                               byte[] frontImage,
                                               byte[] backImage,
                                               String frontFileName,
                                               String backFileName) {
        OcrService.OcrResult ocrResult = ocrService.analyzeIdentityDocument(frontImage, backImage);
        IdentityDocument document = ocrService.buildIdentityDocument(user, documentType, documentNumber, fullName, dateOfBirth, ocrResult);
        document.setFrontImagePath(frontFileName);
        document.setBackImagePath(backFileName);
        document.setStatus(ocrResult.status());
        document.setUpdatedAt(java.time.LocalDateTime.now());

        profileService.createIdentityVerificationRecord(document);

        boolean autoApprove = shouldAutoApprove(ocrResult.status());
        if (autoApprove) {
            profileService.markIdentityVerified(user);
            return VerificationDecision.approved("Tự động duyệt theo OCR");
        }
        return VerificationDecision.pending("Hồ sơ đã được gửi và đang chờ duyệt");
    }

    private boolean shouldAutoApprove(String ocrStatus) {
        return "APPROVED".equalsIgnoreCase(ocrStatus)
                || AppConfig.getBoolean("vnec.identity.autoApprove", false);
    }

    public User getRefreshedUser(int userId) {
        return profileService.getUserById(userId);
    }

    public record VerificationDecision(boolean approved, String message) {
        public static VerificationDecision approved(String message) {
            return new VerificationDecision(true, message);
        }

        public static VerificationDecision pending(String message) {
            return new VerificationDecision(false, message);
        }
    }
}