package com.auction.account.service;

import com.auction.account.dao.UserRepository;
import com.auction.account.dto.KycSubmissionResponse;
import com.auction.common.service.ImageForensicsService;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class KycService {

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_INFO_REQUIRED = "INFO_REQUIRED";
    private static final Set<String> ALLOWED_STATUSES = Set.of(
            STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED, STATUS_INFO_REQUIRED);
    private static final long DOCUMENT_READ_LIMIT = 8L * 1024 * 1024;

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final KycDocumentStorage storage;
    private final KycDocumentValidator validator;
    private final ImageForensicsService forensicsService;

    public KycService(JdbcTemplate jdbcTemplate, UserRepository userRepository,
                      KycDocumentStorage storage, KycDocumentValidator validator,
                      ImageForensicsService forensicsService) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
        this.storage = storage;
        this.validator = validator;
        this.forensicsService = forensicsService;
    }

    @Transactional
    public KycSubmissionResponse submit(
            Long userId, String fullName, String phone, String cccdNumber, LocalDate dob,
            String gender, LocalDate issueDate, String issuePlace,
            MultipartFile frontImage, MultipartFile backImage, MultipartFile selfieImage) throws IOException {
        NormalizedForm form = validateForm(userId, fullName, phone, cccdNumber, dob, gender, issueDate, issuePlace);
        userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new IllegalArgumentException("User does not exist"));
        ensureSubmissionAllowed(userId);
        if (isCccdTakenByOtherUser(form.cccdNumber(), userId)) {
            throw new IllegalArgumentException("This CCCD number is already linked to another account");
        }

        KycDocumentValidator.ValidatedImage front = validator.validate(frontImage, "front ID");
        KycDocumentValidator.ValidatedImage back = validator.validate(backImage, "back ID");
        KycDocumentValidator.ValidatedImage selfie = validator.validate(selfieImage, "selfie");

        List<String> newlyStored = new java.util.ArrayList<>();
        List<String> replacedFiles = currentDocumentReferences(userId);
        try {
            String frontRef = store(front, "front", newlyStored);
            String backRef = store(back, "back", newlyStored);
            String selfieRef = store(selfie, "selfie", newlyStored);
            LocalDateTime now = LocalDateTime.now();

            jdbcTemplate.update("DELETE FROM KycProfiles WHERE UserId = ?", userId);
            jdbcTemplate.update(
                    "INSERT INTO KycProfiles (UserId, Phone, CccdNumber, FullName, Dob, Gender, IssueDate, IssuePlace, "
                            + "FrontImageUrl, BackImageUrl, SelfieImageUrl, Status, SubmittedAt) "
                            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    userId, form.phone(), form.cccdNumber(), form.fullName(), form.dob(), form.gender(),
                    form.issueDate(), form.issuePlace(), frontRef, backRef, selfieRef, STATUS_PENDING, now);
            jdbcTemplate.update(
                    "UPDATE Users SET IdentityVerified = 0, IdentityVerifiedAt = NULL, "
                            + "ProfileStatus = 'PENDING_IDENTITY_VERIFY' WHERE UserId = ?", userId);

            Long kycId = jdbcTemplate.queryForObject(
                    "SELECT TOP 1 KycId FROM KycProfiles WHERE UserId = ? ORDER BY SubmittedAt DESC",
                    Long.class, userId);
            deleteAfterCommit(replacedFiles);
            return loadById(kycId);
        } catch (IOException | RuntimeException ex) {
            storage.deleteAll(newlyStored);
            throw ex;
        }
    }

    public Optional<KycSubmissionResponse> getMyLatest(Long userId) {
        if (userId == null) return Optional.empty();
        List<KycSubmissionResponse> list = jdbcTemplate.query(baseSelect()
                        + " WHERE k.UserId = ? ORDER BY k.SubmittedAt DESC",
                (rs, rowNum) -> mapRow(rs), userId);
        return list.stream().findFirst();
    }

    public List<KycSubmissionResponse> listByStatus(String status) {
        String normalized = normalizeStatus(status);
        String sql = baseSelect() + (normalized == null ? "" : " WHERE k.Status = ?")
                + " ORDER BY k.SubmittedAt DESC";
        return normalized == null
                ? jdbcTemplate.query(sql, (rs, rowNum) -> mapRow(rs))
                : jdbcTemplate.query(sql, (rs, rowNum) -> mapRow(rs), normalized);
    }

    @Transactional
    public KycSubmissionResponse approve(Long kycId, Long staffId) {
        ensureDocumentsCanBeApproved(kycId);
        return updateDecision(kycId, staffId, STATUS_APPROVED, null);
    }

    @Transactional
    public KycSubmissionResponse reject(Long kycId, Long staffId, String reason) {
        return updateDecision(kycId, staffId, STATUS_REJECTED, requireDecisionReason(reason));
    }

    @Transactional
    public KycSubmissionResponse requestInfo(Long kycId, Long staffId, String reason) {
        return updateDecision(kycId, staffId, STATUS_INFO_REQUIRED, requireDecisionReason(reason));
    }

    public StoredDocument loadDocument(Long kycId, String kind, Long requesterId, boolean reviewer) throws IOException {
        String column = switch (kind.toLowerCase(Locale.ROOT)) {
            case "front" -> "FrontImageUrl";
            case "back" -> "BackImageUrl";
            case "selfie" -> "SelfieImageUrl";
            default -> throw new IllegalArgumentException("Unknown KYC document type");
        };
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT UserId, " + column + " AS DocumentRef FROM KycProfiles WHERE KycId = ?", kycId);
        if (rows.isEmpty()) throw new IllegalArgumentException("KYC submission not found");
        Map<String, Object> row = rows.get(0);
        long ownerId = ((Number) row.get("UserId")).longValue();
        if (!reviewer && (requesterId == null || ownerId != requesterId)) {
            throw new SecurityException("You cannot access this KYC document");
        }
        String reference = String.valueOf(row.get("DocumentRef"));
        return new StoredDocument(storage.load(reference), mediaType(reference));
    }

    private KycSubmissionResponse updateDecision(Long kycId, Long staffId, String status, String reason) {
        if (kycId == null || staffId == null) throw new IllegalArgumentException("Missing decision context");
        Integer userId = jdbcTemplate.query(
                "SELECT UserId FROM KycProfiles WHERE KycId = ?",
                rs -> rs.next() ? rs.getInt(1) : null, kycId);
        if (userId == null) throw new IllegalArgumentException("KYC submission not found");

        LocalDateTime now = LocalDateTime.now();
        int updated = jdbcTemplate.update(
                "UPDATE KycProfiles SET Status = ?, ProcessedBy = ?, ProcessedAt = ?, RejectionReason = ? "
                        + "WHERE KycId = ? AND Status = ?",
                status, staffId, now, reason, kycId, STATUS_PENDING);
        if (updated != 1) {
            throw new IllegalStateException("This KYC submission was already processed or changed by another reviewer");
        }

        if (STATUS_APPROVED.equals(status)) {
            Map<String, Object> kyc = jdbcTemplate.queryForMap(
                    "SELECT FullName, Phone, CccdNumber FROM KycProfiles WHERE KycId = ?", kycId);
            jdbcTemplate.update(
                    "UPDATE Users SET IdentityVerified = 1, IdentityVerifiedAt = ?, ProfileStatus = 'VERIFIED', "
                            + "VerificationLevel = 2, FullName = ?, Phone = ?, IdentityNumber = ? WHERE UserId = ?",
                    now, kyc.get("FullName"), kyc.get("Phone"), kyc.get("CccdNumber"), userId);
        } else {
            String profileStatus = STATUS_REJECTED.equals(status) ? "KYC_REJECTED" : "KYC_INFO_REQUIRED";
            jdbcTemplate.update(
                    "UPDATE Users SET IdentityVerified = 0, IdentityVerifiedAt = NULL, ProfileStatus = ? WHERE UserId = ?",
                    profileStatus, userId);
        }
        return loadById(kycId);
    }

    private void ensureDocumentsCanBeApproved(Long kycId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT FrontImageUrl, BackImageUrl, SelfieImageUrl FROM KycProfiles WHERE KycId = ?", kycId);
        if (rows.isEmpty()) throw new IllegalArgumentException("KYC submission not found");
        Map<String, Object> refs = rows.get(0);
        for (String column : List.of("FrontImageUrl", "BackImageUrl", "SelfieImageUrl")) {
            String reference = String.valueOf(refs.get(column));
            try {
                ImageForensicsService.ForensicsReport report = forensicsService.analyse(
                        storage.read(reference, DOCUMENT_READ_LIMIT));
                if (report.riskScore() >= 80) {
                    throw new IllegalArgumentException("Approval blocked: a document has critical integrity warnings");
                }
            } catch (IOException ex) {
                throw new IllegalArgumentException("Approval blocked: a KYC document is unavailable or invalid");
            }
        }
    }

    private KycSubmissionResponse loadById(Long kycId) {
        List<KycSubmissionResponse> list = jdbcTemplate.query(baseSelect() + " WHERE k.KycId = ?",
                (rs, rowNum) -> mapRow(rs), kycId);
        if (list.isEmpty()) throw new IllegalArgumentException("KYC submission not found");
        return list.get(0);
    }

    private String baseSelect() {
        return "SELECT k.KycId, k.UserId, k.FullName, k.Phone, k.CccdNumber, k.Dob, k.Gender, "
                + "k.IssueDate, k.IssuePlace, k.FrontImageUrl, k.BackImageUrl, k.SelfieImageUrl, "
                + "k.Status, k.SubmittedAt, k.ProcessedAt, k.RejectionReason, "
                + "u.Email, p.Username AS ProcessedByName FROM KycProfiles k "
                + "INNER JOIN Users u ON u.UserId = k.UserId LEFT JOIN Users p ON p.UserId = k.ProcessedBy";
    }

    private KycSubmissionResponse mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        long kycId = rs.getLong("KycId");
        return KycSubmissionResponse.builder()
                .kycId(kycId).userId(rs.getLong("UserId")).fullName(rs.getString("FullName"))
                .email(rs.getString("Email")).phone(rs.getString("Phone")).cccdNumber(rs.getString("CccdNumber"))
                .dob(toLocalDate(rs.getDate("Dob"))).gender(rs.getString("Gender"))
                .issueDate(toLocalDate(rs.getDate("IssueDate"))).issuePlace(rs.getString("IssuePlace"))
                .frontImageUrl(documentUrl(kycId, "front")).backImageUrl(documentUrl(kycId, "back"))
                .selfieImageUrl(documentUrl(kycId, "selfie")).status(rs.getString("Status"))
                .submittedAt(toLocalDateTime(rs.getTimestamp("SubmittedAt")))
                .processedAt(toLocalDateTime(rs.getTimestamp("ProcessedAt")))
                .processedByName(rs.getString("ProcessedByName")).rejectionReason(rs.getString("RejectionReason"))
                .frontImageAnalysis(toAnalysis(rs.getString("FrontImageUrl")))
                .backImageAnalysis(toAnalysis(rs.getString("BackImageUrl")))
                .selfieImageAnalysis(toAnalysis(rs.getString("SelfieImageUrl"))).build();
    }

    private KycSubmissionResponse.ImageAnalysis toAnalysis(String reference) {
        try {
            ImageForensicsService.ForensicsReport report = forensicsService.analyse(
                    storage.read(reference, DOCUMENT_READ_LIMIT));
            return KycSubmissionResponse.ImageAnalysis.builder().riskScore(report.riskScore())
                    .severity(report.severity()).signals(report.signals()).build();
        } catch (Exception ex) {
            return KycSubmissionResponse.ImageAnalysis.builder().riskScore(100).severity("HIGH")
                    .signals(List.of(new ImageForensicsService.Signal(
                            ImageForensicsService.Severity.HIGH, "Document unavailable for integrity scan"))).build();
        }
    }

    private NormalizedForm validateForm(Long userId, String fullName, String phone, String cccdNumber,
                                        LocalDate dob, String gender, LocalDate issueDate, String issuePlace) {
        if (userId == null) throw new IllegalArgumentException("Missing user id");
        String cleanName = clean(fullName, 150, "Full name");
        String cleanPhone = clean(phone, 20, "Phone").replaceAll("[ .-]", "");
        String cleanCccd = clean(cccdNumber, 20, "CCCD number").replaceAll("\\s", "");
        String cleanGender = clean(gender, 20, "Gender").toUpperCase(Locale.ROOT);
        String cleanIssuePlace = clean(issuePlace, 200, "Issue place");
        if (!cleanPhone.matches("^(?:\\+84|0)[0-9]{9,10}$")) throw new IllegalArgumentException("Invalid phone number");
        if (!cleanCccd.matches("^[0-9]{12}$")) throw new IllegalArgumentException("CCCD number must contain 12 digits");
        if (!Set.of("MALE", "FEMALE", "OTHER").contains(cleanGender)) throw new IllegalArgumentException("Invalid gender");
        LocalDate today = LocalDate.now();
        if (dob == null || dob.isAfter(today) || Period.between(dob, today).getYears() < 16)
            throw new IllegalArgumentException("Applicant must be at least 16 years old");
        if (issueDate == null || issueDate.isAfter(today) || issueDate.isBefore(dob))
            throw new IllegalArgumentException("Invalid CCCD issue date");
        return new NormalizedForm(cleanName, cleanPhone, cleanCccd, dob, cleanGender, issueDate, cleanIssuePlace);
    }

    private void ensureSubmissionAllowed(Long userId) {
        List<String> statuses = jdbcTemplate.query(
                "SELECT Status FROM KycProfiles WHERE UserId = ?", (rs, rowNum) -> rs.getString(1), userId);
        if (statuses.stream().anyMatch(status -> STATUS_PENDING.equals(status) || STATUS_APPROVED.equals(status))) {
            throw new IllegalStateException("A pending or approved KYC submission cannot be replaced");
        }
    }

    private List<String> currentDocumentReferences(Long userId) {
        return jdbcTemplate.query(
                "SELECT FrontImageUrl, BackImageUrl, SelfieImageUrl FROM KycProfiles WHERE UserId = ?",
                rs -> rs.next() ? List.of(rs.getString(1), rs.getString(2), rs.getString(3)) : List.of(), userId);
    }

    private String store(KycDocumentValidator.ValidatedImage image, String label, List<String> stored) throws IOException {
        String reference = storage.store(image.bytes(), label, image.extension());
        stored.add(reference);
        return reference;
    }

    private void deleteAfterCommit(List<String> references) {
        if (references.isEmpty()) return;
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() { storage.deleteAll(references); }
        });
    }

    private boolean isCccdTakenByOtherUser(String cccdNumber, Long userId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM KycProfiles WHERE CccdNumber = ? AND UserId <> ?",
                Integer.class, cccdNumber, userId);
        return count != null && count > 0;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) return null;
        String normalized = status.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_STATUSES.contains(normalized)) throw new IllegalArgumentException("Unknown KYC status");
        return normalized;
    }

    private String requireDecisionReason(String value) {
        return clean(value, 500, "Review reason");
    }

    private String clean(String value, int maxLength, String label) {
        if (value == null || value.trim().isEmpty()) throw new IllegalArgumentException(label + " is required");
        String normalized = value.trim().replaceAll("\\s+", " ");
        if (normalized.length() > maxLength) throw new IllegalArgumentException(label + " is too long");
        return normalized;
    }

    private String documentUrl(long kycId, String kind) { return "/kyc/" + kycId + "/documents/" + kind; }
    private MediaType mediaType(String reference) {
        return reference != null && reference.toLowerCase(Locale.ROOT).endsWith(".png")
                ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG;
    }
    private LocalDate toLocalDate(java.sql.Date value) { return value == null ? null : value.toLocalDate(); }
    private LocalDateTime toLocalDateTime(java.sql.Timestamp value) { return value == null ? null : value.toLocalDateTime(); }

    private record NormalizedForm(String fullName, String phone, String cccdNumber, LocalDate dob,
                                  String gender, LocalDate issueDate, String issuePlace) {}
    public record StoredDocument(Resource resource, MediaType mediaType) {}
}
