package com.auction.account.service;

import com.auction.account.dao.RoleRepository;
import com.auction.account.dao.UserRepository;
import com.auction.account.dto.CccdDuplicateInfo;
import com.auction.account.dto.KycSubmissionResponse;
import com.auction.account.entity.KycProfile;
import com.auction.account.entity.Role;
import com.auction.account.entity.User;
import com.auction.common.service.CloudinaryService;
import com.auction.common.service.ImageForensicsService;
import com.auction.notification.entity.Notification;
import com.auction.notification.service.NotificationService;
import com.auction.product.entity.Contract;
import com.auction.product.service.ContractService;
import com.auction.bidding.service.AuctionSettlementService;
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

    private static final org.slf4j.Logger auditLog =
            org.slf4j.LoggerFactory.getLogger("KYC_AUDIT");

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_INFO_REQUIRED = "INFO_REQUIRED";

    private final JdbcTemplate jdbcTemplate;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ResourceLoader resourceLoader;
    private final ImageForensicsService imageForensicsService;
    private final CccdOcrService cccdOcrService;
    private final ContractService contractService;
    private final NotificationService notificationService;
    private final CloudinaryService cloudinaryService;
    private final AuctionSettlementService auctionSettlementService;

    @Value("${app.kyc.upload-dir:#{systemProperties['user.dir']}/src/main/resources/static/uploads/kyc}")
    private String uploadDir;

    @Value("${app.kyc.public-prefix:/uploads/kyc}")
    private String publicPrefix;

    @Value("${cloudinary.folder.kyc:auction/kyc}")
    private String kycFolder;

    public KycService(JdbcTemplate jdbcTemplate, UserRepository userRepository, RoleRepository roleRepository,
                      ResourceLoader resourceLoader, ImageForensicsService imageForensicsService, CccdOcrService cccdOcrService,
                      ContractService contractService, NotificationService notificationService,
                      CloudinaryService cloudinaryService,
                      AuctionSettlementService auctionSettlementService) {
        this.jdbcTemplate = jdbcTemplate;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.resourceLoader = resourceLoader;
        this.imageForensicsService = imageForensicsService;
        this.cccdOcrService = cccdOcrService;
        this.contractService = contractService;
        this.notificationService = notificationService;
        this.cloudinaryService = cloudinaryService;
        this.auctionSettlementService = auctionSettlementService;
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
            MultipartFile selfieImage,
            boolean signSellerAgreement
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

        boolean isSeller = user.getRole() != null
                && "Seller".equalsIgnoreCase(user.getRole().getRoleName());
        if (isSeller && !signSellerAgreement && !contractService.hasSellerContract(userId)) {
            throw new IllegalArgumentException(
                    "Người bán cần đồng ý hợp đồng nền tảng trước khi gửi hồ sơ KYC.");
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

        // A new submission invalidates any previous approval until staff approves
        // the newly submitted documents.
        jdbcTemplate.update(
                "UPDATE Users SET IdentityVerified = FALSE, IdentityVerifiedAt = NULL, "
                        + "ProfileStatus = ?, "
                        + "VerificationLevel = CASE WHEN VerificationLevel > 1 THEN 1 ELSE VerificationLevel END "
                        + "WHERE UserId = ?",
                "PENDING_IDENTITY_VERIFY", userId
        );
        auctionSettlementService.cancelSellerListingsForKycRevocation(
                userId,
                "Sản phẩm bị gỡ vì người bán đã gửi lại hồ sơ KYC và đang chờ xác thực."
        );

        if (signSellerAgreement && !contractService.hasSellerContract(userId)) {
            if (!isSeller) {
                Role sellerRole = roleRepository.findByRoleName("Seller")
                        .orElseThrow(() -> new IllegalArgumentException("Seller role not found"));
                user.setRole(sellerRole);
                userRepository.save(user);
                isSeller = true;
            }
            Contract contract = contractService.signSellerContract(userId);
            List<User> staff = userRepository.findAllByRole_RoleName("Staff");
            for (User s : staff) {
                notificationService.createNotification(
                        s.getUserId(),
                        "Hợp đồng seller mới chờ duyệt",
                        "Seller " + user.getFullName() + " (" + user.getEmail()
                                + ") đã gửi KYC và hợp đồng nền tảng đang chờ duyệt.",
                        Notification.NotificationType.GENERAL,
                        contract.getContractId(),
                        "SELLER_CONTRACT");
            }
        }

        Long kycId = jdbcTemplate.queryForObject(
                "SELECT KycId FROM KycProfiles WHERE UserId = ? ORDER BY SubmittedAt DESC LIMIT 1",
                Long.class, userId
        );
        return loadByIdForUser(kycId);
    }

    public Optional<KycSubmissionResponse> getMyLatest(Long userId) {
        if (userId == null) return Optional.empty();
        List<KycSubmissionResponse> list = jdbcTemplate.query(
                "SELECT k.KycId, k.UserId, k.FullName, k.Phone, k.CccdNumber, k.Dob, k.Gender, "
                        + "k.IssueDate, k.IssuePlace, k.FrontImageUrl, k.BackImageUrl, k.SelfieImageUrl, "
                        + "k.Status, k.SubmittedAt, k.ProcessedAt, k.RejectionReason, "
                        + "u.Email, u.FullName AS UserFullName, p.Username AS ProcessedByName "
                        + "FROM KycProfiles k "
                        + "INNER JOIN Users u ON u.UserId = k.UserId "
                        + "LEFT JOIN Users p ON p.UserId = k.ProcessedBy "
                        + "WHERE k.UserId = ? ORDER BY k.SubmittedAt DESC LIMIT 1",
                (rs, rowNum) -> mapRow(rs),
                userId
        );
        return list.isEmpty() ? Optional.empty() : Optional.of(enrichForUser(list.get(0)));
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
                ? jdbcTemplate.query(sql, (rs, rowNum) -> enrichForStaff(mapRow(rs)), status)
                : jdbcTemplate.query(sql, (rs, rowNum) -> enrichForStaff(mapRow(rs)));
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
                    "SELECT FullName, Phone, CccdNumber FROM KycProfiles WHERE KycId = ? LIMIT 1",
                    kycId
            );
            String verifiedFullName = (String) kyc.get("FullName");
            String verifiedPhone = (String) kyc.get("Phone");
            String verifiedCccd = (String) kyc.get("CccdNumber");

            if (!cccdOcrService.findDuplicateAccounts(verifiedCccd, userId.longValue()).isEmpty()) {
                throw new IllegalArgumentException(
                        "Không thể duyệt: số CCCD này đã được đăng ký trên tài khoản khác.");
            }

            // Mirror the approval onto Users so the rest of the app can read
            // identityVerified off the user row without joining KycProfiles.
            jdbcTemplate.update(
                    "UPDATE Users SET IdentityVerified = TRUE, IdentityVerifiedAt = ?, "
                            + "ProfileStatus = 'VERIFIED', VerificationLevel = 2, "
                            + "FullName = COALESCE(?, FullName), "
                            + "Phone = COALESCE(?, Phone), "
                            + "IdentityNumber = COALESCE(?, IdentityNumber) "
                            + "WHERE UserId = ?",
                    now, verifiedFullName, verifiedPhone, verifiedCccd, userId
            );
        } else if (STATUS_REJECTED.equals(newStatus)) {
            jdbcTemplate.update(
                    "UPDATE Users SET IdentityVerified = FALSE, IdentityVerifiedAt = NULL, "
                            + "ProfileStatus = 'KYC_REJECTED', "
                            + "VerificationLevel = CASE WHEN VerificationLevel > 1 THEN 1 ELSE VerificationLevel END "
                            + "WHERE UserId = ?",
                    userId
            );
            auctionSettlementService.cancelSellerListingsForKycRevocation(
                    userId.longValue(),
                    "Sản phẩm bị gỡ vì hồ sơ KYC của người bán đã bị từ chối."
            );
        } else if (STATUS_INFO_REQUIRED.equals(newStatus)) {
            jdbcTemplate.update(
                    "UPDATE Users SET IdentityVerified = FALSE, IdentityVerifiedAt = NULL, "
                            + "ProfileStatus = 'KYC_INFO_REQUIRED', "
                            + "VerificationLevel = CASE WHEN VerificationLevel > 1 THEN 1 ELSE VerificationLevel END "
                            + "WHERE UserId = ?",
                    userId
            );
            auctionSettlementService.cancelSellerListingsForKycRevocation(
                    userId.longValue(),
                    "Sản phẩm bị gỡ vì hồ sơ KYC của người bán cần được bổ sung."
            );
        }

        return loadById(kycId);
    }

    private KycSubmissionResponse loadById(Long kycId) {
        return loadById(kycId, true);
    }

    private KycSubmissionResponse loadByIdForUser(Long kycId) {
        return loadById(kycId, false);
    }

    private KycSubmissionResponse loadById(Long kycId, boolean forStaff) {
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
        return forStaff ? enrichForStaff(list.get(0)) : enrichForUser(list.get(0));
    }

    private KycSubmissionResponse enrichForUser(KycSubmissionResponse response) {
        return response;
    }

    private KycSubmissionResponse enrichForStaff(KycSubmissionResponse response) {
        if (response == null || response.getCccdNumber() == null || response.getCccdNumber().isBlank()) {
            return response;
        }
        List<CccdDuplicateInfo> dupes = cccdOcrService.findDuplicateAccounts(
                response.getCccdNumber(), response.getUserId());
        response.setCccdDuplicate(!dupes.isEmpty());
        response.setCccdDuplicates(dupes);
        return response;
    }

    private KycSubmissionResponse mapRow(java.sql.ResultSet rs) throws java.sql.SQLException {
        String userFullName = rs.getString("UserFullName");
        long kycId = rs.getLong("KycId");
        // Never expose the raw stored value (Cloudinary public_id / legacy path)
        // to clients — hand back the access-controlled proxy endpoint instead.
        KycSubmissionResponse.KycSubmissionResponseBuilder builder = KycSubmissionResponse.builder()
                .kycId(kycId)
                .userId(rs.getLong("UserId"))
                .fullName(userFullName)
                .email(rs.getString("Email"))
                .phone(rs.getString("Phone"))
                .cccdNumber(rs.getString("CccdNumber"))
                .dob(rs.getDate("Dob") != null ? rs.getDate("Dob").toLocalDate() : null)
                .gender(rs.getString("Gender"))
                .issueDate(rs.getDate("IssueDate") != null ? rs.getDate("IssueDate").toLocalDate() : null)
                .issuePlace(rs.getString("IssuePlace"))
                .frontImageUrl(imageProxyUrl(kycId, "front", rs.getString("FrontImageUrl")))
                .backImageUrl(imageProxyUrl(kycId, "back", rs.getString("BackImageUrl")))
                .selfieImageUrl(imageProxyUrl(kycId, "selfie", rs.getString("SelfieImageUrl")))
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

    private String imageProxyUrl(long kycId, String which, String stored) {
        if (stored == null || stored.isBlank()) {
            return null;
        }
        return "/api/kyc/" + kycId + "/image/" + which;
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
        // Legacy public Cloudinary URL: fetch directly over HTTP.
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return cloudinaryService.download(url);
        }
        // Legacy local upload path.
        if (url.startsWith("/") || url.startsWith("uploads/")) {
            return readLegacyDiskBytes(url);
        }
        // New submissions store a PRIVATE Cloudinary public_id.
        return cloudinaryService.downloadPrivate(url);
    }

    private byte[] readLegacyDiskBytes(String url) throws IOException {
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
        // KYC images are sensitive personal data: upload them as PRIVATE
        // (authenticated) Cloudinary assets and persist only the public_id.
        // They can only be viewed through the access-controlled proxy endpoint.
        return cloudinaryService.uploadPrivate(file.getBytes(), kycFolder);
    }

    /**
     * Returns the raw bytes of one KYC image, enforcing that the caller is either
     * the owner of the submission or a staff/admin reviewer.
     *
     * @param which one of {@code front}, {@code back}, {@code selfie}
     */
    public byte[] getImageBytes(Long kycId, String which, Long requesterId, boolean isStaff) throws IOException {
        String column = switch (which == null ? "" : which.toLowerCase()) {
            case "front" -> "FrontImageUrl";
            case "back" -> "BackImageUrl";
            case "selfie" -> "SelfieImageUrl";
            default -> throw new IllegalArgumentException("Unknown image type: " + which);
        };
        Map<String, Object> row = jdbcTemplate.queryForMap(
                "SELECT UserId, " + column + " AS Img FROM KycProfiles WHERE KycId = ?", kycId);
        Long ownerId = ((Number) row.get("UserId")).longValue();
        if (!isStaff && !ownerId.equals(requesterId)) {
            throw new SecurityException("Not allowed to view this KYC image");
        }
        String stored = (String) row.get("Img");
        if (stored == null || stored.isBlank()) {
            throw new IOException("Image not found");
        }
        // Audit trail: record every access to a sensitive KYC image.
        auditLog.info("image_view kycId={} which={} viewerId={} role={} ownerId={}",
                kycId, which, requesterId, isStaff ? "STAFF" : "OWNER", ownerId);
        return readUploadBytes(stored);
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
