package com.auction.account.service;

import com.auction.account.dto.CccdDuplicateInfo;
import com.auction.account.dto.CccdOcrResult;
import com.auction.common.service.GeminiOcrService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CccdOcrService {

    private static final DateTimeFormatter DD_MM_YYYY = DateTimeFormatter.ofPattern("d/M/uuuu");
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;

    private final GeminiOcrService geminiOcrService;
    private final JdbcTemplate jdbcTemplate;

    public CccdOcrResult extract(Long userId, MultipartFile frontImage, MultipartFile backImage) throws IOException {
        if (frontImage == null || frontImage.isEmpty() || backImage == null || backImage.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng tải ảnh mặt trước và mặt sau CCCD");
        }

        JsonNode frontData;
        JsonNode backData;
        try {
            JsonNode dual = geminiOcrService.parseDualIdCardJson(
                    geminiOcrService.scanIdCardPair(frontImage, backImage));
            frontData = dual.path("front");
            backData = dual.path("back");
        } catch (IllegalStateException ex) {
            return CccdOcrResult.builder()
                    .success(false)
                    .provider("gemini")
                    .message(ex.getMessage())
                    .build();
        }

        String cccdNumber = coalesceText(frontData, backData, "id_number");
        String fullName = coalesceText(frontData, backData, "full_name");
        String dob = parseDate(coalesceText(frontData, backData, "date_of_birth"));
        String gender = mapGender(coalesceText(frontData, backData, "gender"));
        String issueDate = parseDate(coalesceText(backData, frontData, "issue_date"));
        String issuePlace = coalesceText(backData, frontData, "place_of_issue");

        CccdOcrResult.CccdOcrResultBuilder builder = CccdOcrResult.builder()
                .success(hasMinimumFields(cccdNumber, fullName, dob))
                .provider("gemini")
                .confidenceScore(0.85)
                .fullName(fullName)
                .cccdNumber(cccdNumber)
                .dob(dob)
                .gender(gender)
                .issueDate(issueDate)
                .issuePlace(issuePlace);

        if (!hasMinimumFields(cccdNumber, fullName, dob)) {
            builder.message("AI không đọc đủ thông tin. Vui lòng kiểm tra ảnh (rõ nét, đủ 4 góc) hoặc điền thủ công.");
        } else {
            builder.message("AI đã trích xuất thông tin. Vui lòng kiểm tra lại trước khi gửi.");
        }

        return builder.build();
    }

    public List<CccdDuplicateInfo> findDuplicateAccounts(String cccdNumber, Long excludeUserId) {
        if (cccdNumber == null || cccdNumber.isBlank() || excludeUserId == null) {
            return List.of();
        }
        String normalized = cccdNumber.trim();
        Map<Long, CccdDuplicateInfo> byUser = new LinkedHashMap<>();

        jdbcTemplate.query(
                "SELECT k.UserId, u.Email, COALESCE(k.FullName, u.FullName) AS FullName, k.Status, u.IdentityVerified "
                        + "FROM KycProfiles k INNER JOIN Users u ON u.UserId = k.UserId "
                        + "WHERE k.CccdNumber = ? AND k.UserId <> ? ORDER BY k.SubmittedAt DESC",
                rs -> {
                    long uid = rs.getLong("UserId");
                    byUser.putIfAbsent(uid, CccdDuplicateInfo.builder()
                            .userId(uid)
                            .email(rs.getString("Email"))
                            .fullName(rs.getString("FullName"))
                            .kycStatus(rs.getString("Status"))
                            .identityVerified(rs.getBoolean("IdentityVerified"))
                            .build());
                },
                normalized, excludeUserId
        );

        jdbcTemplate.query(
                "SELECT u.UserId, u.Email, u.FullName, u.IdentityVerified "
                        + "FROM Users u WHERE u.IdentityNumber = ? AND u.UserId <> ? AND u.IdentityVerified = TRUE",
                rs -> {
                    long uid = rs.getLong("UserId");
                    byUser.putIfAbsent(uid, CccdDuplicateInfo.builder()
                            .userId(uid)
                            .email(rs.getString("Email"))
                            .fullName(rs.getString("FullName"))
                            .kycStatus("APPROVED")
                            .identityVerified(true)
                            .build());
                },
                normalized, excludeUserId
        );

        return new ArrayList<>(byUser.values());
    }

    private static boolean hasMinimumFields(String cccd, String name, String dob) {
        return cccd != null && !cccd.isBlank()
                && name != null && !name.isBlank()
                && dob != null && !dob.isBlank();
    }

    private static String coalesceText(JsonNode primary, JsonNode secondary, String field) {
        String value = firstText(primary, field);
        if (value != null && !value.isBlank()) {
            return value;
        }
        return firstText(secondary, field);
    }

    private static String firstText(JsonNode node, String field) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return null;
        }
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText("").trim();
        return text.isEmpty() || "null".equalsIgnoreCase(text) ? null : text;
    }

    private static String parseDate(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        String normalized = raw.trim().replace('-', '/');
        try {
            LocalDate date = LocalDate.parse(normalized, DD_MM_YYYY);
            return date.format(ISO);
        } catch (DateTimeParseException ignored) {
            // try ISO
        }
        try {
            return LocalDate.parse(raw.trim()).format(ISO);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private static String mapGender(String raw) {
        if (raw == null || raw.isBlank()) {
            return "OTHER";
        }
        String value = raw.trim().toLowerCase(Locale.ROOT);
        if (value.contains("nam") || value.equals("male") || value.equals("m")) {
            return "MALE";
        }
        if (value.contains("nữ") || value.contains("nu") || value.equals("female") || value.equals("f")) {
            return "FEMALE";
        }
        return "OTHER";
    }
}
