package com.auction.common.service;

import com.auction.account.model.IdentityDocument;
import com.auction.account.model.User;
import com.auction.account.model.VerificationStatus;
import com.auction.common.util.AppConfig;
import com.auction.common.util.TokenUtil;

public class OcrService {
    public String getProviderName() {
        return AppConfig.get("vnec.ocr.provider", "fpt.ai");
    }

    public OcrResult analyzeIdentityDocument(byte[] frontImageBytes, byte[] backImageBytes) {
        if (frontImageBytes == null || frontImageBytes.length == 0) {
            throw new IllegalArgumentException("Front image data must not be empty");
        }
        if (backImageBytes == null || backImageBytes.length == 0) {
            throw new IllegalArgumentException("Back image data must not be empty");
        }

        String provider = getProviderName();
        String status = AppConfig.get("vnec.ocr.autoDecision", "false").equalsIgnoreCase("true")
                ? "APPROVED"
                : "PENDING_REVIEW";

        String rawJson = "{" +
                "\"provider\":\"" + provider + "\"," +
                "\"status\":\"" + status + "\"," +
                "\"frontHash\":\"" + TokenUtil.sha256(new String(frontImageBytes, java.nio.charset.StandardCharsets.ISO_8859_1)) + "\"," +
                "\"backHash\":\"" + TokenUtil.sha256(new String(backImageBytes, java.nio.charset.StandardCharsets.ISO_8859_1)) + "\"" +
                "}";

        return new OcrResult(provider, status, rawJson);
    }

    public IdentityDocument buildIdentityDocument(User user, String documentType, String documentNumber, String fullName, java.time.LocalDate dateOfBirth, OcrResult ocrResult) {
        IdentityDocument document = new IdentityDocument(user, documentType, documentNumber, fullName, dateOfBirth, VerificationStatus.PENDING_IDENTITY_VERIFY.name(), java.time.LocalDateTime.now());
        document.setOcrProvider(ocrResult.providerName());
        document.setOcrResultJson(ocrResult.rawJson());
        document.setStatus(ocrResult.status());
        return document;
    }

    public record OcrResult(String providerName, String status, String rawJson) {}
}
