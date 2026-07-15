-- =============================================================================
-- Seed test accounts (password: 123456 for all)
--   user1@gmail.com   — User,  50M wallet, KYC approved
--   user2@gmail.com   — User,  50M wallet, KYC approved
--   admin@gmail.com   — Admin, 50M wallet, KYC approved
--   seller@gmail.com  — Seller, 50M wallet, KYC approved + seller contract
--
-- Run: sqlcmd -S localhost -U sa -P 123456 -d SWP_Nhom3_App -i seed_test_accounts.sql
-- Safe to re-run (upsert).
-- =============================================================================
USE SWP_Nhom3_App;
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

DECLARE @Salt            NVARCHAR(32)  = N'3ce68530b29081c9c64f38132eebf9f3';
DECLARE @PasswordHash    NVARCHAR(128) = N'ed20bdc925310cb7a9db86e00b997942cd7c0dd36f8bb1fd4c2dfb700589dbc0';
DECLARE @Iterations      INT           = 120000;
DECLARE @Now             DATETIME2     = SYSDATETIME();
DECLARE @WalletBalance   BIGINT        = 50000000;

DECLARE @RoleAdmin  INT = (SELECT TOP 1 RoleId FROM Roles WHERE RoleName = N'Admin');
DECLARE @RoleUser   INT = (SELECT TOP 1 RoleId FROM Roles WHERE RoleName = N'User');
DECLARE @RoleSeller INT = (SELECT TOP 1 RoleId FROM Roles WHERE RoleName = N'Seller');

IF @RoleAdmin IS NULL OR @RoleUser IS NULL OR @RoleSeller IS NULL
BEGIN
    RAISERROR(N'Missing Roles. Run SWP_Nhom3_App_full_schema.sql first.', 16, 1);
    RETURN;
END;

DECLARE @Seed TABLE (
    Email           NVARCHAR(255) NOT NULL PRIMARY KEY,
    Username        NVARCHAR(255) NOT NULL,
    FullName        NVARCHAR(150) NOT NULL,
    Phone           NVARCHAR(20)  NOT NULL,
    IdentityNumber  NVARCHAR(20)  NOT NULL,
    RoleId          INT           NOT NULL,
    CccdNumber      NVARCHAR(20)  NOT NULL
);

INSERT INTO @Seed (Email, Username, FullName, Phone, IdentityNumber, RoleId, CccdNumber) VALUES
    (N'user1@gmail.com',   N'user1',   N'Test User One',   N'0912000001', N'USERTEST001',  @RoleUser,   N'001122001001'),
    (N'user2@gmail.com',   N'user2',   N'Test User Two',   N'0912000002', N'USERTEST002',  @RoleUser,   N'001122001002'),
    (N'admin@gmail.com',   N'admingmail',   N'Test Admin',      N'0911000099', N'ADMINTEST99',  @RoleAdmin,  N'001122009901'),
    (N'seller@gmail.com',  N'seller',  N'Test Seller',     N'0911000098', N'SELLERTEST98', @RoleSeller, N'001122009801');

/* --- Upsert Users --------------------------------------------------------- */
MERGE dbo.Users AS target
USING @Seed AS source
ON target.Email = source.Email
WHEN MATCHED THEN
    UPDATE SET
        RoleId               = source.RoleId,
        Username             = source.Username,
        FullName             = source.FullName,
        Phone                = source.Phone,
        IdentityNumber       = source.IdentityNumber,
        PasswordHash         = @PasswordHash,
        Salt                 = @Salt,
        PasswordIterations   = @Iterations,
        EmailVerified        = 1,
        EmailVerifiedAt      = @Now,
        IdentityVerified     = 1,
        IdentityVerifiedAt   = @Now,
        VerificationLevel    = 2,
        ProfileStatus        = N'VERIFIED',
        IsActive             = 1,
        AuthProvider         = N'LOCAL',
        Status               = N'ACTIVE',
        PaymentStrikeCount   = 0,
        LockedByPaymentStrikes = 0
WHEN NOT MATCHED THEN
    INSERT (
        RoleId, Username, FullName, Email, Phone, IdentityNumber,
        PasswordHash, Salt, PasswordIterations,
        EmailVerified, EmailVerifiedAt,
        IdentityVerified, IdentityVerifiedAt,
        VerificationLevel, ProfileStatus,
        IsActive, AuthProvider, Status,
        PaymentStrikeCount, LockedByPaymentStrikes, CreatedAt
    )
    VALUES (
        source.RoleId, source.Username, source.FullName, source.Email, source.Phone, source.IdentityNumber,
        @PasswordHash, @Salt, @Iterations,
        1, @Now,
        1, @Now,
        2, N'VERIFIED',
        1, N'LOCAL', N'ACTIVE',
        0, 0, @Now
    );
GO

DECLARE @Now2 DATETIME2 = SYSDATETIME();

/* --- KYC profiles (approved) ---------------------------------------------- */
DELETE k
FROM dbo.KycProfiles k
INNER JOIN dbo.Users u ON u.UserId = k.UserId
WHERE u.Email IN (N'user1@gmail.com', N'user2@gmail.com', N'admin@gmail.com', N'seller@gmail.com');

INSERT INTO dbo.KycProfiles (
    UserId, Phone, CccdNumber, FullName, Dob, Gender, IssueDate, IssuePlace,
    FrontImageUrl, BackImageUrl, SelfieImageUrl,
    Status, SubmittedAt, ProcessedAt
)
SELECT
    u.UserId,
    s.Phone,
    s.CccdNumber,
    s.FullName,
    CAST('1995-01-15' AS DATE),
    N'Nam',
    CAST('2020-05-20' AS DATE),
    N'Cuc Canh sat QLHC ve TTXH',
    N'/uploads/kyc/seed-front.jpg',
    N'/uploads/kyc/seed-back.jpg',
    N'/uploads/kyc/seed-selfie.jpg',
    N'APPROVED',
    @Now2,
    @Now2
FROM dbo.Users u
INNER JOIN (
    VALUES
        (N'user1@gmail.com',  N'0912000001', N'001122001001', N'Test User One'),
        (N'user2@gmail.com',  N'0912000002', N'001122001002', N'Test User Two'),
        (N'admin@gmail.com',  N'0911000099', N'001122009901', N'Test Admin'),
        (N'seller@gmail.com', N'0911000098', N'001122009801', N'Test Seller')
) AS s(Email, Phone, CccdNumber, FullName) ON s.Email = u.Email;
GO

/* --- Wallets: 50,000,000 VND ---------------------------------------------- */
MERGE dbo.Wallets AS target
USING (
    SELECT u.UserId, CAST(50000000 AS BIGINT) AS Balance
    FROM dbo.Users u
    WHERE u.Email IN (N'user1@gmail.com', N'user2@gmail.com', N'admin@gmail.com', N'seller@gmail.com')
) AS source
ON target.UserId = source.UserId
WHEN MATCHED THEN
    UPDATE SET Balance = source.Balance, HoldBalance = 0, UpdatedAt = SYSDATETIME()
WHEN NOT MATCHED THEN
    INSERT (UserId, Balance, HoldBalance, UpdatedAt)
    VALUES (source.UserId, source.Balance, 0, SYSDATETIME());
GO

/* --- Seller contract (seller@gmail.com only) ------------------------------ */
INSERT INTO dbo.Contracts (ContractType, ReferenceId, FileUrl, CreatedAt)
SELECT
    N'SELLER_AGREEMENT',
    u.UserId,
    N'/uploads/contracts/seller-' + CAST(u.UserId AS NVARCHAR(20)) + N'-seed.pdf',
    SYSDATETIME()
FROM dbo.Users u
WHERE u.Email = N'seller@gmail.com'
  AND NOT EXISTS (
      SELECT 1 FROM dbo.Contracts c
      WHERE c.ContractType = N'SELLER_AGREEMENT' AND c.ReferenceId = u.UserId
  );
GO

PRINT N'Done. Test logins (password 123456):';
PRINT N'  user1@gmail.com   (User)';
PRINT N'  user2@gmail.com   (User)';
PRINT N'  admin@gmail.com   (Admin)';
PRINT N'  seller@gmail.com  (Seller + contract)';
GO

SELECT u.UserId, u.Email, r.RoleName, u.IdentityVerified, u.ProfileStatus,
       w.Balance AS WalletBalance,
       CASE WHEN k.KycId IS NOT NULL THEN k.Status ELSE NULL END AS KycStatus
FROM dbo.Users u
LEFT JOIN dbo.Roles r ON r.RoleId = u.RoleId
LEFT JOIN dbo.Wallets w ON w.UserId = u.UserId
LEFT JOIN dbo.KycProfiles k ON k.UserId = u.UserId
WHERE u.Email IN (N'user1@gmail.com', N'user2@gmail.com', N'admin@gmail.com', N'seller@gmail.com')
ORDER BY u.Email;
GO
