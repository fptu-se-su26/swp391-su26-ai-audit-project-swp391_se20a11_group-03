package com.auction.account.service;

import com.auction.account.dao.UserRepository;
import com.auction.account.dto.KycSubmissionResponse;
import com.auction.account.entity.KycProfile;
import com.auction.account.entity.User;
import com.auction.common.service.ImageForensicsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class KycService {

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_INFO_REQUIRED = "INFO_REQUIRED";

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final ResourceLoader resourceLoader;
    private final ImageForensicsService imageForensicsService;

    @Value("${app.kyc.upload-dir:#{systemProperties['user.dir']}/src/main/resources/static/uploads/kyc}")
    private String uploadDir;

    @Value("${app.kyc.public-prefix:/uploads/kyc}")
    private String publicPrefix;

    public KycService(JdbcTemplate jdbcTemplate, UserRepository userRepository, ResourceLoader resourceLoader, ImageForensicsService imageForensicsService) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
        this.resourceLoader = resourceLoader;
        this.imageForensicsService = imageForensicsService;
    }

    @Transactional
    public KycSubmissionResponse submit(
            Long userId,
            String fullName,
            String phone,
            String cccdNumber,
            LocalDate dob,
            String gender,
            LocalDate issueDate,
            String issuePlace,
            MultipartFile frontImage,
            MultipartFile backImage,
            MultipartFile selfieImage
    ) throws IOException {
        if (userId == null) {
            throw new IllegalArgumentException("Missing user id");
        }
        if (isBlank(fullName) || isBlank(phone) || isBlank(cccdNumber) || dob == null
                || isBlank(gender) || issueDate == null || isBlank(issuePlace)) {
            throw new IllegalArgumentException("Please fill in every required KYC field");
        }
        if (frontImage == null || frontImage.isEmpty()
                || backImage == null || backImage.isEmpty()
                || selfieImage == null || selfieImage.isEmpty()) {
            throw new IllegalArgumentException("Please upload all three ID photos (front, back, selfie)");
        }

        User user = userRepository.findById(Math.toIntExact(userId))
                .orElseThrow(() -> new IllegalArgumentException("User does not exist"));

        // The CCCD number must be unique across the system. Reject duplicates
        // here so we can return a clear error message before persisting.
        if (isCccdTakenByOtherUser(cccdNumber, userId)) {
            throw new IllegalArgumentException("This CCCD number is already linked to another account");
        }

        String frontUrl = saveImage(frontImage, "front");
        String backUrl = saveImage(backImage, "back");
        String selfieUrl = saveImage(selfieImage, "selfie");

        LocalDateTime now = LocalDateTime.now();
        // Wipe any earlier submission so the user always has a single live record.
        jdbcTemplate.update("DELETE FROM KycProfiles WHERE UserId = ?", userId);

        jdbcTemplate.update(
                "INSERT INTO KycProfiles (UserId, Phone, CccdNumber, FullName, Dob, Gender, IssueDate, IssuePlace, "
                        + "FrontImageUrl, BackImageUrl, SelfieImageUrl, Status, SubmittedAt) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                userId, phone, cccdNumber, fullName, dob, gender, issueDate, issuePlace,
                frontUrl, backUrl, selfieUrl, STATUS_PENDING, now
        );

        // Flip the user into a pending-KYC state so the UI can show a "under review" badge.
        jdbcTemplate.update(
                "UPDATE Users SET ProfileStatus = ? WHERE UserId = ?",
                "PENDING_IDENTITY_VERIFY", userId
        );

        Long kycId = jdbcTemplate.queryForObject(
                "SELECT TOP 1 KycId FROM KycProfiles WHERE UserId = ? ORDER BY SubmittedAt DESC",
                Long.class, userId
        );
        return loadById(kycId);
    }

    public Optional<KycSubmissionResponse> getMyLatest(Long userId) {
        if (userId == null) return Optional.empty();
        List<KycSubmissionResponse> list = jdbcTemplate.query(
                "SELECT TOP 1 k.KycId, k.UserId, k.FullName, k.Phone, k.CccdNumber, k.Dob, k.Gender, "
                        + "k.IssueDate, k.IssuePlace, k.FrontImageUrl, k.BackImageUrl, k.SelfieImageUrl, "
                        + "k.Status, k.SubmittedAt, k.ProcessedAt, k.RejectionReason, "
                        + "u.Email, u.FullName AS UserFullName, p.Username AS ProcessedByName "
                        + "FROM KycProfiles k "
                        + "INNER JOIN Users u ON u.UserId = k.UserId "
                        + "LEFT JOIN Users p ON p.UserId = k.ProcessedBy "
                        + "WHERE k.UserId = ? ORDER BY k.SubmittedAt DESC",
                (rs, rowNum) -> mapRow(rs),
                userId
        );
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public List<KycSubmissionResponse> listByStatus(String status) {
        String sql = "SELECT k.KycId, k.UserId, k.FullName, k.Phone, k.CccdNumber, k.Dob, k.Gender, "
                + "k.IssueDate, k.IssuePlace, k.FrontImageUrl, k.BackImageUrl, k.SelfieImageUrl, "
                + "k.Status, k.SubmittedAt, k.ProcessedAt, k.RejectionReason, "
                + "u.Email, u.FullName AS UserFullName, p.Username AS ProcessedByName "
                + "FROM KycProfiles k "
                + "INNER JOIN Users u ON u.UserId = k.UserId "
                + "LEFT JOIN Users p ON p.UserId = k.ProcessedBy "
                + (status != null && !status.isBlank() ? "WHERE k.Status = ? " : "")
                + "ORDER BY k.SubmittedAt DESC";
        return status != null && !status.isBlank()
                ? jdbcTemplate.query(sql, (rs, rowNum) -> mapRow(rs), status)
                : jdbcTemplate.query(sql, (rs, rowNum) -> mapRow(rs));
    }

    @Transactional
    public KycSubmissionResponse approve(Long kycId, Long staffId) {
        return updateDecision(kycId, staffId, STATUS_APPROVED, null);
    }

    @Transactional
    public KycSubmissionResponse reject(Long kycId, Long staffId, String reason) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Please provide a rejection reason");
        }
        return updateDecision(kycId, staffId, STATUS_REJECTED, reason);
    }

    @Transactional
    public KycSubmissionResponse requestInfo(Long kycId, Long staffId, String reason) {
        return updateDecision(kycId, staffId, STATUS_INFO_REQUIRED,
                reason == null || reason.isBlank() ? "Please re-upload clearer images" : reason);
    }

    private KycSubmissionResponse updateDecision(Long kycId, Long staffId, String newStatus, String rejectionReason) {
        Integer userId = jdbcTemplate.queryForObject(
                "SELECT UserId FROM KycProfiles WHERE KycId = ?", Integer.class, kycId);
        if (userId == null) {
            throw new IllegalArgumentException("KYC submission not found");
        }
        LocalDateTime now = LocalDateTime.now();
        jdbcTemplate.update(
                "UPDATE KycProfiles SET Status = ?, ProcessedBy = ?, ProcessedAt = ?, RejectionReason = ? WHERE KycId = ?",
                newStatus, staffId, now, rejectionReason, kycId
        );

        if (STATUS_APPROVED.equals(newStatus)) {
            // Pull the latest KYC data so we can mirror it onto the user row.
            // This ensures Users.FullName / Phone / IdentityNumber always reflect
            // the verified identity info, not whatever the user typed at signup.
            Map<String, Object> kyc = jdbcTemplate.queryForMap(
                    "SELECT TOP 1 FullName, Phone, CccdNumber FROM KycProfiles WHERE KycId = ?",
                    kycId
            );
            String verifiedFullName = (String) kyc.get("FullName");
            String verifiedPhone = (String) kyc.get("Phone");
            String verifiedCccd = (String) kyc.get("CccdNumber");

            // Mirror the approval onto Users so the rest of the app can read
            // identityVerified off the user row without joining KycProfiles.
            jdbcTemplate.update(
                    "UPDATE Users SET IdentityVerified = 1, IdentityVerifiedAt = ?, "
                            + "ProfileStatus = 'VERIFIED', VerificationLevel = 2, "
                            + "FullName = COALESCE(?, FullName), "
                            + "Phone = COALESCE(?, Phone), "
                            + "IdentityNumber = COALESCE(?, IdentityNumber) "
                            + "WHERE UserId = ?",
                    now, verifiedFullName, verifiedPhone, verifiedCccd, userId
            );
        } else if (STATUS_REJECTED.equals(newStatus)) {
            jdbcTemplate.update(
                    "UPDATE Users SET IdentityVerified = 0, ProfileStatus = 'KYC_REJECTED' WHERE UserId = ?",
                    userId
            );
        } else if (STATUS_INFO_REQUIRED.equals(newStatus)) {
            jdbcTemplate.update(
                    "UPDATE Users SET ProfileStatus = 'KYC_INFO_REQUIRED' WHERE UserId = ?",
                    userId
            );
        }

        return loadById(kycId);
    }

    private KycSubmissionResponse loadById(Long kycId) {
        List<KycSubmissionResponse> list = jdbcTemplate.query(
                "SELECT k.KycId, k.UserId, k.FullName, k.Phone, k.CccdNumber, k.Dob, k.Gender, "
                        + "k.IssueDate, k.IssuePlace, k.FrontImageUrl, k.BackImageUrl, k.SelfieImageUrl, "
                        + "k.Status, k.SubmittedAt, k.ProcessedAt, k.RejectionReason, "
                        + "u.Email, u.FullName AS UserFullName, p.Username AS ProcessedByName "
                        + "FROM KycProfiles k "
                        + "INNER JOIN Users u ON u.UserId = k.UserId "
                        + "LEFT JOIN Users p ON p.UserId = k.ProcessedBy "
                        + "WHERE k.KycId = ?",
                (rs, rowNum) -> mapRow(rs),
                kycId
        );
        if (list.isEmpty()) {
            throw new IllegalArgumentException("KYC submission not found");
        }
        return list.get(0);
    }

    private KycSubmissionResponse mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        String userFullName = rs.getString("UserFullName");
        KycSubmissionResponse.KycSubmissionResponseBuilder builder = KycSubmissionResponse.builder()
                .kycId(rs.getLong("KycId"))
                .userId(rs.getLong("UserId"))
                .fullName(userFullName)
                .email(rs.getString("Email"))
                .phone(rs.getString("Phone"))
                .cccdNumber(rs.getString("CccdNumber"))
                .dob(rs.getDate("Dob") != null ? rs.getDate("Dob").toLocalDate() : null)
                .gender(rs.getString("Gender"))
                .issueDate(rs.getDate("IssueDate") != null ? rs.getDate("IssueDate").toLocalDate() : null)
                .issuePlace(rs.getString("IssuePlace"))
                .frontImageUrl(rs.getString("FrontImageUrl"))
                .backImageUrl(rs.getString("BackImageUrl"))
                .selfieImageUrl(rs.getString("SelfieImageUrl"))
                .status(rs.getString("Status"))
                .submittedAt(rs.getTimestamp("SubmittedAt") != null ? rs.getTimestamp("SubmittedAt").toLocalDateTime() : null)
                .processedAt(rs.getTimestamp("ProcessedAt") != null ? rs.getTimestamp("ProcessedAt").toLocalDateTime() : null)
                .processedByName(rs.getString("ProcessedByName"))
                .rejectionReason(rs.getString("RejectionReason"));
        builder.frontImageAnalysis(toAnalysis(rs.getString("FrontImageUrl")));
        builder.backImageAnalysis(toAnalysis(rs.getString("BackImageUrl")));
        builder.selfieImageAnalysis(toAnalysis(rs.getString("SelfieImageUrl")));
        return builder.build();
    }

    private KycSubmissionResponse.ImageAnalysis toAnalysis(String url) {
        if (url == null || url.isBlank()) {
            return KycSubmissionResponse.ImageAnalysis.builder()
                    .riskScore(100)
                    .severity("HIGH")
                    .signals(java.util.List.of(
                            new ImageForensicsService.Signal(
                                    ImageForensicsService.Severity.HIGH,
                                    "Image URL is missing - the user did not upload this photo")))
                    .build();
        }
        try {
            byte[] bytes = readUploadBytes(url);
            ImageForensicsService.ForensicsReport report = imageForensicsService.analyse(bytes);
            return KycSubmissionResponse.ImageAnalysis.builder()
                    .riskScore(report.riskScore())
                    .severity(report.severity())
                    .signals(report.signals())
                    .build();
        } catch (Exception ex) {
            return KycSubmissionResponse.ImageAnalysis.builder()
                    .riskScore(80)
                    .severity("HIGH")
                    .signals(java.util.List.of(
                            new ImageForensicsService.Signal(
                                    ImageForensicsService.Severity.HIGH,
                                    "Forensic scan failed: " + ex.getMessage())))
                    .build();
        }
    }

    private byte[] readUploadBytes(String url) throws IOException {
        String fileName = url.startsWith("/") ? url.substring(1) : url;
        if (fileName.startsWith("uploads/")) {
            fileName = fileName.substring("uploads/".length());
        }
        String bareName = fileName.substring(fileName.lastIndexOf('/') + 1);

        Path primary = resolveUploadDir().resolve(bareName);
        if (Files.exists(primary)) {
            return Files.readAllBytes(primary);
        }
        Path classesMirror = Paths.get(System.getProperty("user.dir"), "target", "classes", "static", "uploads", "kyc", bareName);
        if (Files.exists(classesMirror)) {
            return Files.readAllBytes(classesMirror);
        }
        throw new IOException("KYC image not found on disk: " + bareName);
    }

    private boolean isCccdTakenByOtherUser(String cccdNumber, Long userId) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM KycProfiles WHERE CccdNumber = ? AND UserId <> ?",
                Integer.class, cccdNumber, userId
        );
        return count != null && count > 0;
    }

    private String saveImage(MultipartFile file, String label) throws IOException {
        Path targetDir = resolveUploadDir();
        Files.createDirectories(targetDir);

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String extension = "";
        int dot = original.lastIndexOf('.');
        if (dot > 0 && dot < original.length() - 1) {
            extension = original.substring(dot);
        }
        String stored = "kyc-" + label + "-" + UUID.randomUUID() + extension;
        Path destination = targetDir.resolve(stored);
        byte[] bytes;
        try (var in = file.getInputStream()) {
            bytes = in.readAllBytes();
        }
        Files.write(destination, bytes);

        mirrorToClassesDir(destination, stored, bytes);
        return publicPrefix + "/" + stored;
    }

    /**
     * When the app is started with `mvn spring-boot:run`, static resources are
     * served from the {@code target/classes/static} copy, not from
     * {@code src/main/resources/static}. We mirror every upload into the
     * classes folder so the new image is reachable via {@code /uploads/kyc/*}
     * without restarting the server.
     */
    private void mirrorToClassesDir(Path source, String storedFileName, byte[] bytes) {
        try {
            Path classesKyc = Paths.get(System.getProperty("user.dir"), "target", "classes", "static", "uploads", "kyc");
            if (classesKyc.startsWith(source.getParent())) {
                return;
            }
            Files.createDirectories(classesKyc);
            Files.write(classesKyc.resolve(storedFileName), bytes);
        } catch (IOException ex) {
            System.err.println("[KycService] Failed to mirror upload to target/classes/static/uploads/kyc: " + ex.getMessage());
        }
    }

    private Path resolveUploadDir() throws IOException {
        if (uploadDir.startsWith("classpath:")) {
            java.net.URL url = resourceLoader.getResource(uploadDir).getURL();
            String pathString;
            try {
                pathString = Paths.get(url.toURI()).toString();
            } catch (java.net.URISyntaxException ex) {
                pathString = url.getPath();
            }
            return Paths.get(pathString);
        }
        return Paths.get(uploadDir);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
