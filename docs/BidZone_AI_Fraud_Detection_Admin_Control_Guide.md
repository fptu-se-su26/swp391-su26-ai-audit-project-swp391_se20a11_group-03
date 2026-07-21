# BidZone – AI Fraud Detection & Admin Control Guide

## 1. Mục tiêu

Triển khai hệ thống phát hiện hành vi gian lận trong đấu giá cho dự án **BidZone**.

Hệ thống cần:

- Phát hiện seller tự bid sản phẩm của mình.
- Phát hiện nhiều tài khoản cùng IP hoặc cùng thiết bị.
- Phát hiện hai tài khoản liên tục bid qua lại.
- Phát hiện hành vi bid quá nhanh hoặc bất thường.
- Tính `risk score`.
- Tạm hạn chế quyền bid hoặc tạm khóa tài khoản theo mức độ.
- Gửi cảnh báo realtime cho Admin.
- Cho phép Admin bật/tắt từng phần của hệ thống.
- Cho phép Admin xác nhận gian lận, bỏ qua cảnh báo, mở khóa hoặc ban tài khoản.

> `Bid` nghĩa là một lần đặt giá/trả giá trong phiên đấu giá.

---

## 2. Công nghệ giả định

- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: Java + Spring Boot
- Database: PostgreSQL
- Authentication: Spring Security + JWT
- Realtime: WebSocket
- Payment: SePay
- Architecture: Controller - Service - Repository

---

## 3. Nguyên tắc quan trọng

- Không để AI hoặc rule engine tự ban vĩnh viễn ngay lập tức.
- Chỉ tự động tạm hạn chế hoặc tạm khóa ở mức rủi ro cao.
- Admin là người quyết định ban vĩnh viễn.
- Seller tự bid phải luôn bị chặn, kể cả khi Fraud Detection đang tắt.
- IP và device chỉ là tín hiệu hỗ trợ, không phải bằng chứng tuyệt đối.
- Không tin `userId`, `sellerId`, `riskScore` hoặc trạng thái gửi từ frontend.
- Mọi xử lý bảo mật phải thực hiện ở backend.
- Mọi action tự động phải được lưu audit log.

---

## 4. Luồng xử lý tổng thể

```text
User đặt giá
    ↓
BidController
    ↓
BidService
    ├── Kiểm tra auction đang hoạt động
    ├── Chặn seller tự bid
    ├── Kiểm tra giá hợp lệ
    ├── Lưu bid
    └── Publish BidCreatedEvent
            ↓
      FraudDetectionService
            ├── Shared IP
            ├── Shared Device
            ├── Rapid Bidding
            ├── Repeated Bidding Pair
            ├── Seller-linked Account
            └── Risk Score
                    ↓
              FraudActionService
                    ├── Log
                    ├── Alert Admin
                    ├── Restrict Bid
                    └── Suspend Account
                            ↓
                    Admin Dashboard
```

---

## 5. Cấu hình Admin

Admin Dashboard cần có ba công tắc riêng:

```text
Fraud Detection       [ ON / OFF ]
Automatic Restriction [ ON / OFF ]
Realtime Admin Alerts [ ON / OFF ]
```

### Ý nghĩa

#### Fraud Detection

```text
ON
→ Phân tích mọi bid mới
→ Tính risk score
→ Tạo fraud alert
```

```text
OFF
→ Không phân tích fraud cho bid mới
→ Không tạo fraud alert mới
→ Auction vẫn hoạt động bình thường
```

#### Automatic Restriction

```text
ON
→ HIGH có thể bị khóa quyền bid tạm thời
→ CRITICAL có thể bị tạm đình chỉ tài khoản
```

```text
OFF
→ Hệ thống chỉ cảnh báo
→ Admin tự xử lý thủ công
```

#### Realtime Admin Alerts

```text
ON
→ Admin nhận WebSocket notification ngay
```

```text
OFF
→ Vẫn lưu fraud alert trong database
→ Không hiện popup realtime
```

### Rule không được tắt

Dù Fraud Detection đang OFF:

```text
Seller bid vào auction của chính mình
→ Luôn bị chặn
```

---

## 6. Database cho cấu hình

### Bảng `system_settings`

```sql
CREATE TABLE system_settings (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    updated_by BIGINT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_system_setting_admin
        FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

Dữ liệu khởi tạo:

```sql
INSERT INTO system_settings(setting_key, setting_value)
VALUES
    ('FRAUD_DETECTION_ENABLED', 'true'),
    ('AUTO_RESTRICTION_ENABLED', 'false'),
    ('FRAUD_ALERT_ENABLED', 'true');
```

---

## 7. Audit log cấu hình

### Bảng `system_setting_audit_logs`

```sql
CREATE TABLE system_setting_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255) NOT NULL,
    changed_by BIGINT NOT NULL,
    reason VARCHAR(500),
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_setting_audit_admin
        FOREIGN KEY (changed_by) REFERENCES users(id)
);
```

Mỗi lần Admin thay đổi cấu hình phải lưu:

- Admin ID.
- Setting key.
- Giá trị cũ.
- Giá trị mới.
- Lý do.
- Thời gian thay đổi.

---

## 8. Enum cấu hình

```java
public enum SystemSettingKey {
    FRAUD_DETECTION_ENABLED,
    AUTO_RESTRICTION_ENABLED,
    FRAUD_ALERT_ENABLED
}
```

---

## 9. FraudConfigService

```java
@Service
@RequiredArgsConstructor
public class FraudConfigService {

    private final SystemSettingRepository settingRepository;

    public boolean isDetectionEnabled() {
        return getBoolean(
            SystemSettingKey.FRAUD_DETECTION_ENABLED,
            true
        );
    }

    public boolean isAutoRestrictionEnabled() {
        return getBoolean(
            SystemSettingKey.AUTO_RESTRICTION_ENABLED,
            false
        );
    }

    public boolean isAlertEnabled() {
        return getBoolean(
            SystemSettingKey.FRAUD_ALERT_ENABLED,
            true
        );
    }

    private boolean getBoolean(
            SystemSettingKey key,
            boolean defaultValue
    ) {
        return settingRepository.findBySettingKey(key.name())
            .map(SystemSetting::getSettingValue)
            .map(Boolean::parseBoolean)
            .orElse(defaultValue);
    }
}
```

---

## 10. DTO cấu hình Admin

```java
public record UpdateFraudSettingsRequest(
    boolean detectionEnabled,
    boolean autoRestrictionEnabled,
    boolean alertEnabled,
    String reason
) {
}
```

```java
public record FraudSettingsResponse(
    boolean detectionEnabled,
    boolean autoRestrictionEnabled,
    boolean alertEnabled,
    LocalDateTime updatedAt
) {
}
```

---

## 11. API cấu hình Admin

### Xem cấu hình hiện tại

```http
GET /api/admin/settings/fraud-detection
```

### Cập nhật cấu hình

```http
PATCH /api/admin/settings/fraud-detection
```

Request:

```json
{
  "detectionEnabled": true,
  "autoRestrictionEnabled": false,
  "alertEnabled": true,
  "reason": "Disable automatic restriction during testing"
}
```

### Quyền

Chỉ cho phép:

```text
SUPER_ADMIN
```

Hoặc permission:

```text
MANAGE_SYSTEM_SETTINGS
```

---

## 12. Chặn seller tự bid

Đây là validation bắt buộc, không phụ thuộc cấu hình AI.

```java
private void validateSellerCannotBid(
        Auction auction,
        User bidder
) {
    if (auction.getSeller().getId().equals(bidder.getId())) {
        throw new BusinessException(
            "Seller cannot bid on their own auction"
        );
    }
}
```

Chèn trước khi lưu bid:

```java
validateAuction(auction);
validateSellerCannotBid(auction, bidder);
validateBidAmount(auction, request.amount());
```

---

## 13. Publish event sau khi lưu bid

```java
@Transactional
public BidResponse createBid(
        CreateBidRequest request,
        String userEmail,
        String ipAddress
) {
    User bidder = getCurrentUser(userEmail);
    Auction auction = getAuctionForUpdate(request.auctionId());

    validateAuction(auction);
    validateSellerCannotBid(auction, bidder);
    validateBidAmount(auction, request.amount());

    Bid savedBid = bidRepository.save(
        createBidEntity(request, auction, bidder, ipAddress)
    );

    eventPublisher.publishEvent(
        new BidCreatedEvent(savedBid.getId())
    );

    return BidResponse.from(savedBid);
}
```

---

## 14. Xử lý bất đồng bộ

```java
@Component
@RequiredArgsConstructor
public class BidCreatedEventListener {

    private final FraudDetectionService fraudDetectionService;

    @Async
    @EventListener
    public void handle(BidCreatedEvent event) {
        fraudDetectionService.analyzeBid(event.bidId());
    }
}
```

Luồng:

```text
Bid hợp lệ
→ Lưu bid
→ Trả response cho user
→ Fraud Detection chạy phía sau
→ Không làm chậm API đặt giá
```

---

## 15. FraudDetectionService

```java
@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final FraudConfigService fraudConfigService;
    private final BidRepository bidRepository;
    private final FraudActionService fraudActionService;

    @Transactional
    public void analyzeBid(Long bidId) {
        if (!fraudConfigService.isDetectionEnabled()) {
            return;
        }

        Bid bid = bidRepository.findByIdWithRelations(bidId)
            .orElseThrow(() ->
                new ResourceNotFoundException("Bid not found")
            );

        List<FraudSignal> signals = Stream.of(
                detectSharedIp(bid),
                detectSharedDevice(bid),
                detectRapidBidding(bid),
                detectRepeatedBiddingPair(bid),
                detectSellerLinkedAccount(bid)
            )
            .flatMap(Optional::stream)
            .toList();

        if (signals.isEmpty()) {
            return;
        }

        int riskScore = signals.stream()
            .mapToInt(FraudSignal::score)
            .sum();

        fraudActionService.process(
            bid,
            signals,
            riskScore
        );
    }
}
```

---

## 16. Fraud rules

### Shared IP

Điều kiện gợi ý:

```text
3 account khác nhau
→ cùng IP
→ cùng auction
→ trong 10 phút
```

Score:

```text
+20
```

### Shared Device

Điều kiện gợi ý:

```text
2 account khác nhau
→ cùng device ID
→ cùng auction
```

Score:

```text
+35
```

### Rapid Bidding

Điều kiện gợi ý:

```text
10 bid trong 30 giây
```

Hoặc:

```text
20 bid trong 1 phút
```

Score:

```text
+15
```

### Repeated Bidding Pair

Điều kiện gợi ý:

```text
A → B → A → B → A → B
```

Tối thiểu 6 lượt xen kẽ.

Score:

```text
+25
```

### Seller-linked Account

Điều kiện gợi ý:

- Cùng thiết bị với seller.
- Cùng IP lặp lại nhiều lần với seller.
- Account thường xuyên bid sản phẩm của cùng seller.
- Thường đẩy giá nhưng hiếm khi thắng hoặc thanh toán.

Score:

```text
+40
```

---

## 17. Risk level

```java
private FraudRiskLevel resolveRiskLevel(int score) {
    if (score >= 80) {
        return FraudRiskLevel.CRITICAL;
    }

    if (score >= 50) {
        return FraudRiskLevel.HIGH;
    }

    if (score >= 30) {
        return FraudRiskLevel.MEDIUM;
    }

    return FraudRiskLevel.LOW;
}
```

Mức độ:

```text
0–29   → LOW
30–49  → MEDIUM
50–79  → HIGH
80+    → CRITICAL
```

---

## 18. Action theo risk level

```java
public enum FraudAction {
    LOG_ONLY,
    WARN_ADMIN,
    TEMPORARY_BID_RESTRICTION,
    TEMPORARY_ACCOUNT_SUSPENSION,
    REQUIRE_ADMIN_REVIEW,
    PERMANENT_BAN
}
```

### LOW

```text
Action:
- Ghi log
- Không hạn chế user
```

### MEDIUM

```text
Action:
- Tạo fraud alert
- Gửi cảnh báo Admin nếu alert đang bật
- User vẫn được bid
```

### HIGH

```text
Action:
- Tạo fraud alert
- Nếu Auto Restriction ON:
  - Khóa quyền bid 30 phút
- Gửi cảnh báo Admin
```

### CRITICAL

```text
Action:
- Tạo fraud alert
- Nếu Auto Restriction ON:
  - Tạm đình chỉ account
  - Chặn quyền bid
- Gửi cảnh báo khẩn cho Admin
```

### Permanent Ban

Chỉ Admin được phép:

```text
CONFIRM FRAUD
→ PERMANENT BAN
```

---

## 19. FraudActionService

```java
@Service
@RequiredArgsConstructor
public class FraudActionService {

    private final FraudConfigService fraudConfigService;
    private final FraudAlertService fraudAlertService;
    private final UserRestrictionService userRestrictionService;
    private final AdminNotificationService adminNotificationService;

    @Transactional
    public void process(
            Bid bid,
            List<FraudSignal> signals,
            int riskScore
    ) {
        FraudRiskLevel riskLevel = resolveRiskLevel(riskScore);

        FraudAlert alert = fraudAlertService.createOrUpdate(
            bid,
            signals,
            riskScore,
            riskLevel
        );

        if (
            fraudConfigService.isAutoRestrictionEnabled()
            && riskLevel == FraudRiskLevel.HIGH
        ) {
            userRestrictionService.restrictBidding(
                bid.getBidder().getId(),
                Duration.ofMinutes(30),
                alert.getId()
            );
        }

        if (
            fraudConfigService.isAutoRestrictionEnabled()
            && riskLevel == FraudRiskLevel.CRITICAL
        ) {
            userRestrictionService.suspendAccount(
                bid.getBidder().getId(),
                alert.getId()
            );
        }

        if (fraudConfigService.isAlertEnabled()) {
            adminNotificationService.notifyAdmin(alert);
        }
    }
}
```

---

## 20. Trạng thái tài khoản

```java
public enum AccountStatus {
    ACTIVE,
    BID_RESTRICTED,
    TEMPORARILY_SUSPENDED,
    UNDER_REVIEW,
    BANNED
}
```

Nên có thêm:

```text
bidRestrictedUntil
suspendedAt
suspensionReason
bannedAt
bannedBy
```

---

## 21. Fraud Alert entity

Các field nên có:

```text
id
auctionId
suspectedUserId
fraudType
riskScore
riskLevel
description
status
automaticAction
occurrenceCount
firstDetectedAt
lastDetectedAt
reviewedBy
reviewedAt
adminNote
```

Status:

```java
public enum FraudAlertStatus {
    PENDING,
    REVIEWING,
    CONFIRMED,
    DISMISSED
}
```

---

## 22. Realtime alert cho Admin

WebSocket event:

```json
{
  "type": "FRAUD_ALERT_CREATED",
  "alertId": 102,
  "auctionId": 52,
  "suspectedUserId": 27,
  "riskScore": 85,
  "riskLevel": "CRITICAL",
  "automaticAction": "TEMPORARY_ACCOUNT_SUSPENSION",
  "message": "Suspicious bidding behavior detected"
}
```

Admin UI:

```text
CRITICAL FRAUD ALERT

Auction: #52
User: #27
Risk Score: 85

Detected:
- Shared device
- Repeated bidding pair
- Seller-linked account

Automatic Action:
Account temporarily suspended

[View Details]
[Confirm Ban]
[Dismiss]
[Restore User]
```

---

## 23. Admin Fraud API

```http
GET /api/admin/fraud-alerts
GET /api/admin/fraud-alerts/{id}
POST /api/admin/fraud-alerts/{id}/review
POST /api/admin/fraud-alerts/{id}/confirm
POST /api/admin/fraud-alerts/{id}/dismiss
POST /api/admin/fraud-alerts/{id}/restore-user
POST /api/admin/users/{userId}/ban
```

Filter:

```text
status
riskLevel
fraudType
auctionId
userId
page
size
```

---

## 24. Admin UI

### Trang Fraud Detection Settings

```text
Fraud Detection Settings

Fraud Detection       [ ON ]
Automatic Restriction [ OFF ]
Realtime Admin Alerts [ ON ]

Reason:
[________________________________]

[Save Changes]
```

### Trang Fraud Alerts

Hiển thị:

- Risk level.
- Risk score.
- Auction.
- Suspected user.
- Fraud signals.
- Automatic action.
- Status.
- Last detected time.
- Admin actions.

---

## 25. API phải chặn user bị hạn chế

Trong `BidService`:

```java
private void validateBidderStatus(User bidder) {
    if (bidder.getStatus() == AccountStatus.BANNED) {
        throw new BusinessException("Account is banned");
    }

    if (bidder.getStatus() == AccountStatus.TEMPORARILY_SUSPENDED) {
        throw new BusinessException(
            "Account is temporarily suspended"
        );
    }

    if (
        bidder.getStatus() == AccountStatus.BID_RESTRICTED
        && bidder.getBidRestrictedUntil().isAfter(LocalDateTime.now())
    ) {
        throw new BusinessException(
            "Bidding is temporarily restricted"
        );
    }
}
```

Chạy trước khi lưu bid.

---

## 26. Testing

### Unit Test

- Seller tự bid luôn bị chặn.
- Fraud Detection OFF thì không phân tích.
- Alert OFF thì không gửi WebSocket.
- Auto Restriction OFF thì không khóa user.
- HIGH + Auto Restriction ON thì khóa bid tạm thời.
- CRITICAL + Auto Restriction ON thì suspend account.
- Admin xác nhận thì ban account.
- Admin dismiss thì không ban account.
- Không tạo fraud alert trùng.
- Risk score map đúng level.

### Integration Test

```text
Create seller
Create auction
Create multiple bidder accounts
Place suspicious bids
Verify fraud alert
Verify automatic restriction
Verify WebSocket notification
Verify Admin action
```

---

## 27. Security Notes

- Chỉ `SUPER_ADMIN` được thay đổi Fraud Settings.
- Chỉ Admin được xem fraud alerts.
- Không để frontend tự gửi risk score.
- Không để frontend tự đổi account status.
- Hash device ID trước khi lưu.
- Không tin hoàn toàn `X-Forwarded-For`.
- Không lưu JWT hoặc SePay secret vào log.
- Lưu audit log cho mọi hành động:
  - Restrict.
  - Suspend.
  - Restore.
  - Ban.
  - Dismiss.
  - Thay đổi setting.

---

## 28. Thứ tự triển khai

### Phase 1

- Seller self-bidding prevention.
- Lưu IP và device ID.
- Fraud settings table.
- Admin settings API.

### Phase 2

- Shared IP.
- Shared device.
- Rapid bidding.
- Fraud alert entity.

### Phase 3

- Repeated bidding pair.
- Seller-linked account.
- Risk score.

### Phase 4

- Automatic restriction.
- Account status.
- Audit log.

### Phase 5

- Admin Fraud Dashboard.
- WebSocket realtime alert.
- Confirm ban / dismiss / restore.

### Phase 6

- Async event processing.
- Performance optimization.
- Fraud analytics.

---

## 29. Definition of Done

Hoàn thành khi:

- Seller không thể bid auction của mình.
- Admin bật/tắt được Fraud Detection.
- Admin bật/tắt được Auto Restriction.
- Admin bật/tắt được Realtime Alert.
- Hệ thống phát hiện ít nhất 3 fraud rules.
- Có risk score và risk level.
- HIGH có thể bị khóa bid tạm thời.
- CRITICAL có thể bị suspend.
- Admin nhận cảnh báo realtime.
- Admin có thể confirm, dismiss, restore và ban.
- Có audit log.
- Có unit test và integration test.
- Không làm chậm đáng kể API đặt giá.
- Không merge trực tiếp vào `main`.

---

## 30. Branch và commit

Branch:

```text
feature/ai-fraud-detection-admin-control
```

Commit:

```text
feat: add fraud detection settings
feat: add seller self-bidding prevention
feat: store bid device and ip metadata
feat: implement rule-based fraud detection
feat: add automatic bidder restriction
feat: add realtime admin fraud alerts
feat: add admin fraud management APIs
test: add fraud detection integration tests
```

---

## 31. Nội dung CV sau khi hoàn thành

```text
• Developed a rule-based shill bidding detection system using device, IP, and bidding behavior signals.
• Implemented automated bidder restriction and realtime fraud alerts for administrators.
• Built an admin control module to configure fraud detection, review alerts, and manage account bans.
```

---

## 32. Prompt đưa cho AI coding agent

```text
Read this markdown file and implement the feature phase by phase.

Requirements:
- Inspect the current BidZone project structure before coding.
- Reuse existing entities, repositories, exceptions, response wrappers, and conventions.
- Follow Controller-Service-Repository architecture.
- Do not modify unrelated modules.
- Do not add dependencies unless necessary.
- Implement Phase 1 first.
- Show the implementation plan before changing code.
- Run build and tests after each phase.
- List every created and modified file.
- Do not commit secrets or SePay credentials.
- Keep seller self-bidding prevention always enabled.
- Do not allow automatic permanent bans.
- Permanent bans must require Admin confirmation.
```
