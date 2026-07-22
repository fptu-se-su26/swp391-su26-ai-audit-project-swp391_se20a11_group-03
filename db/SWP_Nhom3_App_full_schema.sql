-- =============================================================================
-- SWP_Nhom3_App — Full SQL Server schema (synced with current Java codebase)
-- Generated for: com.auction.* entities + DataSeeder bootstrap columns
--
-- Usage (SSMS or sqlcmd):
--   1. Run this script on SQL Server (sa or admin login).
--   2. Update application.properties if you use a different database name:
--        spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=SWP_Nhom3_App;encrypt=true;trustServerCertificate=true
--   3. Start backend with app.seed.enabled=true to insert demo users/categories
--      OR keep app.seed.enabled=false and register users via the app.
--
-- WARNING: Section "DROP" destroys all data in this database.
-- =============================================================================

/* --- CREATE DATABASE ------------------------------------------------------- */
IF DB_ID(N'SWP_Nhom3_App') IS NULL
BEGIN
    CREATE DATABASE SWP_Nhom3_App;
END;
GO

USE SWP_Nhom3_App;
GO

/* --- DROP EXISTING TABLES (fresh install) --------------------------------- */
-- Uncomment the block below only when you want to wipe and recreate schema.

/*
IF OBJECT_ID('dbo.Auction_Chat_Messages', 'U') IS NOT NULL DROP TABLE dbo.Auction_Chat_Messages;
IF OBJECT_ID('dbo.Bids', 'U') IS NOT NULL DROP TABLE dbo.Bids;
IF OBJECT_ID('dbo.Auction_Deposits', 'U') IS NOT NULL DROP TABLE dbo.Auction_Deposits;
IF OBJECT_ID('dbo.Auctions', 'U') IS NOT NULL DROP TABLE dbo.Auctions;
IF OBJECT_ID('dbo.Messages', 'U') IS NOT NULL DROP TABLE dbo.Messages;
IF OBJECT_ID('dbo.Conversations', 'U') IS NOT NULL DROP TABLE dbo.Conversations;
IF OBJECT_ID('dbo.Notifications', 'U') IS NOT NULL DROP TABLE dbo.Notifications;
IF OBJECT_ID('dbo.ProductAttributeValues', 'U') IS NOT NULL DROP TABLE dbo.ProductAttributeValues;
IF OBJECT_ID('dbo.attribute_options', 'U') IS NOT NULL DROP TABLE dbo.attribute_options;
IF OBJECT_ID('dbo.CategoryAttributes', 'U') IS NOT NULL DROP TABLE dbo.CategoryAttributes;
IF OBJECT_ID('dbo.ProductApprovals', 'U') IS NOT NULL DROP TABLE dbo.ProductApprovals;
IF OBJECT_ID('dbo.ProductImages', 'U') IS NOT NULL DROP TABLE dbo.ProductImages;
IF OBJECT_ID('dbo.watchlist', 'U') IS NOT NULL DROP TABLE dbo.watchlist;
IF OBJECT_ID('dbo.Watchlist', 'U') IS NOT NULL DROP TABLE dbo.Watchlist;
IF OBJECT_ID('dbo.Contracts', 'U') IS NOT NULL DROP TABLE dbo.Contracts;
IF OBJECT_ID('dbo.WithdrawalRequests', 'U') IS NOT NULL DROP TABLE dbo.WithdrawalRequests;
IF OBJECT_ID('dbo.Transactions', 'U') IS NOT NULL DROP TABLE dbo.Transactions;
IF OBJECT_ID('dbo.Wallets', 'U') IS NOT NULL DROP TABLE dbo.Wallets;
IF OBJECT_ID('dbo.KycProfiles', 'U') IS NOT NULL DROP TABLE dbo.KycProfiles;
IF OBJECT_ID('dbo.IdentityDocuments', 'U') IS NOT NULL DROP TABLE dbo.IdentityDocuments;
IF OBJECT_ID('dbo.UserVerificationTokens', 'U') IS NOT NULL DROP TABLE dbo.UserVerificationTokens;
IF OBJECT_ID('dbo.PendingEmailVerifications', 'U') IS NOT NULL DROP TABLE dbo.PendingEmailVerifications;
IF OBJECT_ID('dbo.PasswordResetTokens', 'U') IS NOT NULL DROP TABLE dbo.PasswordResetTokens;
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NOT NULL DROP TABLE dbo.AuditLogs;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
GO
*/

/* --- CORE: ROLES & USERS --------------------------------------------------- */
IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Roles (
        RoleId      INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        RoleName    NVARCHAR(50)      NOT NULL UNIQUE
    );
END;
GO

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Users (
        UserId                  BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        RoleId                  INT                  NULL,
        Username                NVARCHAR(255)        NULL,
        FullName                NVARCHAR(150)        NOT NULL,
        Email                   NVARCHAR(255)        NOT NULL UNIQUE,
        Phone                   NVARCHAR(20)         NULL,
        IdentityNumber          NVARCHAR(20)         NULL,
        PasswordHash            NVARCHAR(128)        NOT NULL,
        Salt                    NVARCHAR(32)         NOT NULL,
        PasswordIterations      INT                  NOT NULL,
        EmailVerified           BIT                  NOT NULL DEFAULT 0,
        EmailVerifiedAt         DATETIME2            NULL,
        PhoneVerified           BIT                  NOT NULL DEFAULT 0,
        PhoneVerifiedAt         DATETIME2            NULL,
        IdentityVerified        BIT                  NOT NULL DEFAULT 0,
        IdentityVerifiedAt      DATETIME2            NULL,
        VerificationLevel       TINYINT              NOT NULL DEFAULT 0,
        ProfileStatus           NVARCHAR(30)         NOT NULL DEFAULT 'PENDING_PROFILE',
        IsActive                BIT                  NOT NULL DEFAULT 1,
        AuthProvider            NVARCHAR(30)         NOT NULL DEFAULT 'LOCAL',
        Status                  NVARCHAR(30)         NOT NULL DEFAULT 'ACTIVE',
        PaymentStrikeCount      INT                  NOT NULL DEFAULT 0,
        LockedByPaymentStrikes  BIT                  NOT NULL DEFAULT 0,
        BidRestrictedUntil      DATETIME2            NULL,
        SuspendedAt             DATETIME2            NULL,
        SuspensionReason        NVARCHAR(500)        NULL,
        BannedAt                DATETIME2            NULL,
        BannedBy                BIGINT               NULL,
        AiValuationUsedCount    INT                  NOT NULL DEFAULT 0,
        CreatedAt               DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId),
        CONSTRAINT FK_Users_BannedBy FOREIGN KEY (BannedBy) REFERENCES dbo.Users(UserId)
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_Users_Phone_NotNull'
      AND object_id = OBJECT_ID('dbo.Users')
)
BEGIN
    CREATE UNIQUE INDEX UX_Users_Phone_NotNull
        ON dbo.Users(Phone)
        WHERE Phone IS NOT NULL;
END;
GO

-- Allow multiple NULL identity numbers; unique only when set
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_Users_IdentityNumber_NotNull' AND object_id = OBJECT_ID('dbo.Users')
)
BEGIN
    CREATE UNIQUE INDEX UX_Users_IdentityNumber_NotNull
        ON dbo.Users(IdentityNumber)
        WHERE IdentityNumber IS NOT NULL;
END;
GO

IF OBJECT_ID('dbo.AuditLogs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuditLogs (
        AuditLogID  BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Action      NVARCHAR(30)         NOT NULL,
        Success     BIT                  NOT NULL,
        Subject     NVARCHAR(255)        NULL,
        Detail      NVARCHAR(500)        NULL,
        IpAddress   NVARCHAR(64)         NULL,
        UserAgent   NVARCHAR(500)        NULL,
        CreatedAt   DATETIME2            NOT NULL DEFAULT SYSDATETIME()
    );
END;
GO

IF OBJECT_ID('dbo.IdentityDocuments', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.IdentityDocuments (
        IdentityDocumentID  BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserID              BIGINT               NOT NULL,
        DocumentType        NVARCHAR(20)         NOT NULL,
        DocumentNumber      NVARCHAR(20)         NOT NULL,
        FullName            NVARCHAR(150)        NOT NULL,
        DateOfBirth         DATE                 NULL,
        FrontImagePath      NVARCHAR(500)        NULL,
        BackImagePath       NVARCHAR(500)        NULL,
        OcrProvider         NVARCHAR(50)         NULL,
        OcrResultJson       NVARCHAR(MAX)        NULL,
        Status              NVARCHAR(30)         NOT NULL,
        ReviewedBy          NVARCHAR(100)        NULL,
        ReviewedAt          DATETIME2            NULL,
        CreatedAt           DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt           DATETIME2            NULL,
        CONSTRAINT FK_IdentityDocuments_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserId)
    );
END;
GO

IF OBJECT_ID('dbo.UserVerificationTokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserVerificationTokens (
        VerificationTokenID BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserID              BIGINT               NOT NULL,
        TokenHash           NVARCHAR(128)        NOT NULL,
        TokenType           NVARCHAR(30)         NOT NULL,
        ExpiresAt           DATETIME2            NOT NULL,
        UsedAt              DATETIME2            NULL,
        CreatedAt           DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_UserVerificationTokens_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserId)
    );
END;
GO

IF OBJECT_ID('dbo.PendingEmailVerifications', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PendingEmailVerifications (
        VerificationId         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Email                  NVARCHAR(255) NOT NULL,
        OtpSalt                NVARCHAR(64)  NOT NULL,
        OtpHash                NVARCHAR(64)  NOT NULL,
        RegistrationTokenHash  NVARCHAR(64)  NULL,
        AttemptCount           INT           NOT NULL DEFAULT 0,
        ExpiresAt              DATETIME2     NOT NULL,
        VerifiedAt             DATETIME2     NULL,
        ConsumedAt             DATETIME2     NULL,
        CreatedAt              DATETIME2     NOT NULL DEFAULT SYSDATETIME()
    );
    CREATE INDEX IX_PendingEmailVerifications_Email_CreatedAt
        ON dbo.PendingEmailVerifications(Email, CreatedAt DESC);
    CREATE UNIQUE INDEX UX_PendingEmailVerifications_RegistrationToken
        ON dbo.PendingEmailVerifications(RegistrationTokenHash)
        WHERE RegistrationTokenHash IS NOT NULL;
END;
GO

IF OBJECT_ID('dbo.PasswordResetTokens', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PasswordResetTokens (
        PasswordResetTokenID BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserID               BIGINT               NOT NULL,
        TokenHash            NVARCHAR(128)        NOT NULL,
        ExpiresAt            DATETIME2            NOT NULL,
        UsedAt               DATETIME2            NULL,
        CreatedAt            DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserId)
    );
END;
GO

IF OBJECT_ID('dbo.KycProfiles', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.KycProfiles (
        KycId            BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId           BIGINT               NOT NULL UNIQUE,
        Phone            NVARCHAR(30)         NOT NULL,
        CccdNumber       NVARCHAR(20)         NOT NULL,
        FullName         NVARCHAR(255)        NOT NULL,
        Dob              DATE                 NOT NULL,
        Gender           NVARCHAR(20)         NOT NULL,
        IssueDate        DATE                 NOT NULL,
        IssuePlace       NVARCHAR(255)        NOT NULL,
        FrontImageUrl    NVARCHAR(500)        NOT NULL,
        BackImageUrl     NVARCHAR(500)        NOT NULL,
        SelfieImageUrl   NVARCHAR(500)        NOT NULL,
        Status           NVARCHAR(20)         NOT NULL,
        SubmittedAt      DATETIME2            NOT NULL,
        ProcessedBy      BIGINT               NULL,
        ProcessedAt      DATETIME2            NULL,
        RejectionReason  NVARCHAR(500)        NULL,
        CONSTRAINT FK_KycProfiles_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_KycProfiles_ProcessedBy FOREIGN KEY (ProcessedBy) REFERENCES dbo.Users(UserId)
    );
    -- CCCD may duplicate across accounts; staff review flags duplicates (no UNIQUE on CccdNumber)
END;
GO

/* --- CATALOG: CATEGORIES & PRODUCTS ---------------------------------------- */
IF OBJECT_ID('dbo.Categories', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Categories (
        CategoryId    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CategoryName  NVARCHAR(100)     NOT NULL UNIQUE,
        Description   NVARCHAR(500)     NULL,
        IsActive      BIT               NOT NULL DEFAULT 1,
        CreatedAt     DATETIME2         NOT NULL DEFAULT SYSDATETIME()
    );
END;
GO

IF OBJECT_ID('dbo.Products', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Products (
        ProductId                  BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        SellerId                   BIGINT               NOT NULL,
        CategoryId                 INT                  NOT NULL,
        ProductName                NVARCHAR(255)        NOT NULL,
        Description                NVARCHAR(MAX)        NULL,
        ImagesUrl                  NVARCHAR(MAX)        NULL,
        [Condition]                NVARCHAR(100)        NULL,
        Brand                      NVARCHAR(150)        NULL,
        Origin                     NVARCHAR(150)        NULL,
        WeightSize                 NVARCHAR(150)        NULL,
        StartingPrice              BIGINT               NOT NULL,
        StepPrice                  BIGINT               NOT NULL DEFAULT 1000000,
        TaxPercent                 INT                  NOT NULL DEFAULT 5,
        Status                     NVARCHAR(30)         NOT NULL DEFAULT 'PENDING',
        AuctionMode                NVARCHAR(10)         NULL,
        ScheduledStartTime         DATETIME2            NULL,
        ScheduledDurationSeconds   BIGINT               NULL,
        SubmittedAt                DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CreatedAt                  DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        RejectionReason            NVARCHAR(500)        NULL,
        IsLockedInEvent            BIT                  NOT NULL DEFAULT 0,
        CONSTRAINT FK_Products_Users FOREIGN KEY (SellerId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(CategoryId)
    );
END;
GO

IF OBJECT_ID('dbo.ProductImages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ProductImages (
        ImageId     BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ProductId   BIGINT               NOT NULL,
        ImageUrl    NVARCHAR(500)        NOT NULL,
        IsPrimary   BIT                  NOT NULL DEFAULT 0,
        CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId)
    );
END;
GO

IF OBJECT_ID('dbo.ProductApprovals', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ProductApprovals (
        ApprovalId   BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ProductId    BIGINT               NOT NULL,
        ReviewedBy   BIGINT               NOT NULL,
        Status       NVARCHAR(30)         NOT NULL,
        Reason       NVARCHAR(500)        NULL,
        ReviewedAt   DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_ProductApprovals_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId),
        CONSTRAINT FK_ProductApprovals_Users FOREIGN KEY (ReviewedBy) REFERENCES dbo.Users(UserId)
    );
END;
GO

IF OBJECT_ID('dbo.Contracts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Contracts (
        ContractId    BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ContractType  NVARCHAR(50)         NOT NULL,
        ReferenceId   BIGINT               NOT NULL,
        FileUrl       NVARCHAR(500)        NOT NULL,
        CreatedAt     DATETIME2            NOT NULL DEFAULT SYSDATETIME()
    );
END;
GO

IF OBJECT_ID('dbo.CategoryAttributes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CategoryAttributes (
        AttributeId    BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        CategoryId     INT                  NOT NULL,
        AttributeName  NVARCHAR(100)        NOT NULL,
        DataType       NVARCHAR(50)         NOT NULL,
        IsRequired     BIT                  NOT NULL DEFAULT 0,
        DisplayOrder   INT                  NOT NULL DEFAULT 0,
        CONSTRAINT FK_CategoryAttributes_Categories FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(CategoryId)
    );
END;
GO

IF OBJECT_ID('dbo.ProductAttributeValues', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ProductAttributeValues (
        ValueId         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ProductId       BIGINT               NOT NULL,
        AttributeId     BIGINT               NOT NULL,
        AttributeValue  NVARCHAR(500)        NOT NULL,
        CONSTRAINT FK_ProductAttributeValues_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId),
        CONSTRAINT FK_ProductAttributeValues_Attributes FOREIGN KEY (AttributeId) REFERENCES dbo.CategoryAttributes(AttributeId)
    );
END;
GO

IF OBJECT_ID('dbo.attribute_options', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.attribute_options (
        OptionId     BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        AttributeId  BIGINT               NOT NULL,
        OptionValue  NVARCHAR(100)        NOT NULL,
        CONSTRAINT FK_attribute_options_Attributes FOREIGN KEY (AttributeId) REFERENCES dbo.CategoryAttributes(AttributeId)
    );
END;
GO

IF OBJECT_ID('dbo.watchlist', 'U') IS NULL
BEGIN
  -- JPA entity @Table(name = "watchlist")
    CREATE TABLE dbo.watchlist (
        watchlist_id  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        user_id       BIGINT            NOT NULL,
        product_id    BIGINT            NOT NULL,
        created_at    DATETIME2         NULL,
        CONSTRAINT FK_watchlist_users FOREIGN KEY (user_id) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_watchlist_products FOREIGN KEY (product_id) REFERENCES dbo.Products(ProductId)
    );
END;
GO

/* --- WALLET ---------------------------------------------------------------- */
IF OBJECT_ID('dbo.Wallets', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Wallets (
        WalletId     BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId       BIGINT               NOT NULL UNIQUE,
        Balance      BIGINT               NOT NULL DEFAULT 0,
        HoldBalance  BIGINT               NOT NULL DEFAULT 0,
        UpdatedAt    DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Wallets_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
    );
END;
GO

IF OBJECT_ID('dbo.Transactions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Transactions (
        TransactionId    BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        WalletId         BIGINT               NOT NULL,
        Amount           BIGINT               NOT NULL,
        TransactionType  NVARCHAR(40)         NOT NULL,
        Status           NVARCHAR(30)         NOT NULL,
        ReferenceCode    NVARCHAR(120)        NULL,
        Description      NVARCHAR(500)        NULL,
        CreatedAt        DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Transactions_Wallets FOREIGN KEY (WalletId) REFERENCES dbo.Wallets(WalletId)
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_Transactions_ReferenceCode' AND object_id = OBJECT_ID('dbo.Transactions')
)
BEGIN
    CREATE INDEX IX_Transactions_ReferenceCode ON dbo.Transactions(ReferenceCode);
END;
GO

IF OBJECT_ID('dbo.WithdrawalRequests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.WithdrawalRequests (
        WithdrawalRequestId  BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId               BIGINT               NOT NULL,
        WalletId             BIGINT               NOT NULL,
        Amount               BIGINT               NOT NULL,
        BankName             NVARCHAR(120)        NOT NULL,
        AccountNumber        NVARCHAR(60)         NOT NULL,
        AccountName          NVARCHAR(150)        NOT NULL,
        Status               NVARCHAR(30)         NOT NULL,
        StaffNote            NVARCHAR(500)        NULL,
        CreatedAt            DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt            DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_WithdrawalRequests_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_WithdrawalRequests_Wallets FOREIGN KEY (WalletId) REFERENCES dbo.Wallets(WalletId)
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_WithdrawalRequests_Status' AND object_id = OBJECT_ID('dbo.WithdrawalRequests')
)
BEGIN
    CREATE INDEX IX_WithdrawalRequests_Status ON dbo.WithdrawalRequests(Status, CreatedAt DESC);
END;
GO

/* --- AUCTIONS & BIDDING ---------------------------------------------------- */
IF OBJECT_ID('dbo.Auctions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auctions (
        AuctionId                  BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ProductId                  BIGINT               NOT NULL UNIQUE,
        AuctionMode                NVARCHAR(10)         NOT NULL DEFAULT 'TIMED',
        ScheduledDurationSeconds   BIGINT               NULL,
        StartTime                  DATETIME2            NOT NULL,
        EndTime                    DATETIME2            NOT NULL,
        CurrentHighestBid          BIGINT               NOT NULL DEFAULT 0,
        CurrentWinnerUserId        BIGINT               NULL,
        Status                     NVARCHAR(30)         NOT NULL,
        PaymentStatus              NVARCHAR(20)         NULL DEFAULT 'PENDING',
        PaymentDeadline            DATETIME2            NULL,
        SettledAt                  DATETIME2            NULL,
        CreatedAt                  DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Auctions_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId),
        CONSTRAINT FK_Auctions_Winner FOREIGN KEY (CurrentWinnerUserId) REFERENCES dbo.Users(UserId)
    );
END;
GO

IF OBJECT_ID('dbo.Auction_Deposits', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auction_Deposits (
        DepositId       BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        AuctionId       BIGINT               NOT NULL,
        UserId          BIGINT               NOT NULL,
        DepositAmount   BIGINT               NOT NULL,
        Status          NVARCHAR(30)         NOT NULL,
        SettlementType  NVARCHAR(20)         NULL,
        SettledAt       DATETIME2            NULL,
        CreatedAt       DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT UQ_AuctionDeposits_Auction_User UNIQUE (AuctionId, UserId),
        CONSTRAINT FK_AuctionDeposits_Auctions FOREIGN KEY (AuctionId) REFERENCES dbo.Auctions(AuctionId),
        CONSTRAINT FK_AuctionDeposits_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
    );
END;
GO

IF OBJECT_ID('dbo.Bids', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Bids (
        BidId      BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        AuctionId  BIGINT               NOT NULL,
        UserId     BIGINT               NOT NULL,
        BidAmount  BIGINT               NOT NULL,
        BidTime    DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        IpAddress  NVARCHAR(64)         NULL,
        DeviceHash NVARCHAR(64)         NULL,
        CONSTRAINT FK_Bids_Auctions FOREIGN KEY (AuctionId) REFERENCES dbo.Auctions(AuctionId),
        CONSTRAINT FK_Bids_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
    );
    CREATE INDEX IX_Bids_Auction_Time ON dbo.Bids(AuctionId, BidTime DESC);
    CREATE INDEX IX_Bids_Auction_Ip_Time ON dbo.Bids(AuctionId, IpAddress, BidTime DESC);
    CREATE INDEX IX_Bids_Auction_Device ON dbo.Bids(AuctionId, DeviceHash);
    CREATE INDEX IX_Bids_User_Time ON dbo.Bids(UserId, BidTime DESC);
END;
GO

IF OBJECT_ID('dbo.SystemSettings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SystemSettings (
        SettingId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        SettingKey NVARCHAR(100) NOT NULL UNIQUE,
        SettingValue NVARCHAR(255) NOT NULL,
        UpdatedBy BIGINT NULL,
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_SystemSettings_Users FOREIGN KEY (UpdatedBy) REFERENCES dbo.Users(UserId)
    );
END;
GO

IF OBJECT_ID('dbo.SystemSettingAuditLogs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SystemSettingAuditLogs (
        SettingAuditId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        SettingKey NVARCHAR(100) NOT NULL,
        OldValue NVARCHAR(255) NULL,
        NewValue NVARCHAR(255) NOT NULL,
        ChangedBy BIGINT NOT NULL,
        Reason NVARCHAR(500) NULL,
        ChangedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_SystemSettingAuditLogs_Users FOREIGN KEY (ChangedBy) REFERENCES dbo.Users(UserId)
    );
END;
GO

IF OBJECT_ID('dbo.FraudAlerts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FraudAlerts (
        FraudAlertId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        AuctionId BIGINT NOT NULL,
        SuspectedUserId BIGINT NOT NULL,
        TriggerBidId BIGINT NULL,
        FraudType NVARCHAR(100) NOT NULL,
        Signals NVARCHAR(1000) NOT NULL,
        RiskScore INT NOT NULL,
        RiskLevel NVARCHAR(20) NOT NULL,
        Description NVARCHAR(2000) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
        AutomaticAction NVARCHAR(50) NOT NULL DEFAULT 'WARN_ADMIN',
        OccurrenceCount INT NOT NULL DEFAULT 1,
        FirstDetectedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        LastDetectedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        ReviewedBy BIGINT NULL,
        ReviewedAt DATETIME2 NULL,
        AdminNote NVARCHAR(1000) NULL,
        CONSTRAINT FK_FraudAlerts_Auctions FOREIGN KEY (AuctionId) REFERENCES dbo.Auctions(AuctionId),
        CONSTRAINT FK_FraudAlerts_SuspectedUser FOREIGN KEY (SuspectedUserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_FraudAlerts_TriggerBid FOREIGN KEY (TriggerBidId) REFERENCES dbo.Bids(BidId),
        CONSTRAINT FK_FraudAlerts_Reviewer FOREIGN KEY (ReviewedBy) REFERENCES dbo.Users(UserId)
    );
    CREATE INDEX IX_FraudAlerts_Status_Risk_Time ON dbo.FraudAlerts(Status, RiskLevel, LastDetectedAt DESC);
    CREATE INDEX IX_FraudAlerts_Auction_User ON dbo.FraudAlerts(AuctionId, SuspectedUserId);
END;
GO

IF OBJECT_ID('dbo.Auction_Chat_Messages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auction_Chat_Messages (
        MessageId  BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        AuctionId  BIGINT               NOT NULL,
        SenderId   BIGINT               NOT NULL,
        Content    NVARCHAR(1000)       NOT NULL,
        SentAt     DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_AuctionChat_Auction FOREIGN KEY (AuctionId) REFERENCES dbo.Auctions(AuctionId),
        CONSTRAINT FK_AuctionChat_User FOREIGN KEY (SenderId) REFERENCES dbo.Users(UserId)
    );
END;
GO

/* --- CHAT (support) -------------------------------------------------------- */
IF OBJECT_ID('dbo.Conversations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Conversations (
        ConversationId    BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId            BIGINT               NOT NULL,
        AssignedStaff     BIGINT               NULL,
        SellerId          BIGINT               NULL,
        ProductId         BIGINT               NULL,
        ConversationType  NVARCHAR(30)         NOT NULL,
        subject           NVARCHAR(255)        NOT NULL,
        status            NVARCHAR(30)         NOT NULL,
        createdAt         DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        updatedAt         DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Conversations_User FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_Conversations_AssignedStaff FOREIGN KEY (AssignedStaff) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_Conversations_Seller FOREIGN KEY (SellerId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_Conversations_Product FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId)
    );
END;
GO

IF OBJECT_ID('dbo.Messages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Messages (
        MessageId       BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        ConversationId  BIGINT               NOT NULL,
        SenderId        BIGINT               NOT NULL,
        content         NVARCHAR(MAX)        NOT NULL,
        isRead          BIT                  NOT NULL DEFAULT 0,
        sentAt          DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Messages_Conversations FOREIGN KEY (ConversationId) REFERENCES dbo.Conversations(ConversationId),
        CONSTRAINT FK_Messages_Users FOREIGN KEY (SenderId) REFERENCES dbo.Users(UserId)
    );
END;
GO

/* --- NOTIFICATIONS --------------------------------------------------------- */
IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notifications (
        NotificationId  BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        UserId          BIGINT               NOT NULL,
        Title           NVARCHAR(200)        NOT NULL,
        Message         NVARCHAR(1000)       NOT NULL,
        Type            NVARCHAR(50)         NOT NULL,
        ReferenceId     BIGINT               NULL,
        ReferenceType   NVARCHAR(50)         NULL,
        IsRead          BIT                  NOT NULL DEFAULT 0,
        CreatedAt       DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
    );
END;
GO

/* --- UPGRADE: add columns missing on older installs ---------------------- */
IF COL_LENGTH('dbo.Users', 'PaymentStrikeCount') IS NULL
    ALTER TABLE dbo.Users ADD PaymentStrikeCount INT NOT NULL DEFAULT 0;
IF COL_LENGTH('dbo.Users', 'LockedByPaymentStrikes') IS NULL
    ALTER TABLE dbo.Users ADD LockedByPaymentStrikes BIT NOT NULL DEFAULT 0;
IF COL_LENGTH('dbo.Users', 'CreatedAt') IS NULL
    ALTER TABLE dbo.Users ADD CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME();
IF COL_LENGTH('dbo.Users', 'BidRestrictedUntil') IS NULL
    ALTER TABLE dbo.Users ADD BidRestrictedUntil DATETIME2 NULL;
IF COL_LENGTH('dbo.Users', 'SuspendedAt') IS NULL
    ALTER TABLE dbo.Users ADD SuspendedAt DATETIME2 NULL;
IF COL_LENGTH('dbo.Users', 'SuspensionReason') IS NULL
    ALTER TABLE dbo.Users ADD SuspensionReason NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.Users', 'BannedAt') IS NULL
    ALTER TABLE dbo.Users ADD BannedAt DATETIME2 NULL;
IF COL_LENGTH('dbo.Users', 'BannedBy') IS NULL
    ALTER TABLE dbo.Users ADD BannedBy BIGINT NULL;
IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Users_BannedBy')
    ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_BannedBy FOREIGN KEY (BannedBy) REFERENCES dbo.Users(UserId);
IF COL_LENGTH('dbo.Products', 'IsLockedInEvent') IS NULL
    ALTER TABLE dbo.Products ADD IsLockedInEvent BIT NOT NULL DEFAULT 0;
GO

IF OBJECT_ID('dbo.FeaturedProducts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FeaturedProducts (
        FeaturedId    BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PeriodType    NVARCHAR(10)         NOT NULL,
        ProductId     BIGINT               NOT NULL,
        DisplayOrder  INT                  NOT NULL,
        UpdatedAt     DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        UpdatedBy     BIGINT               NULL,
        CONSTRAINT UQ_Featured_Period_Order UNIQUE (PeriodType, DisplayOrder),
        CONSTRAINT FK_Featured_Product FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId)
    );
    CREATE INDEX IX_FeaturedProducts_PeriodType ON dbo.FeaturedProducts(PeriodType);
END;
GO

/* --- AUCTION EVENT MODULE -------------------------------------------------- */
IF OBJECT_ID('dbo.AuctionEvents', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AuctionEvents (
        EventId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Name NVARCHAR(255) NOT NULL,
        Slug NVARCHAR(255) NOT NULL UNIQUE,
        Description NVARCHAR(MAX) NULL,
        BannerUrl NVARCHAR(500) NULL,
        EventCategory NVARCHAR(20) NOT NULL,
        BiddingMode NVARCHAR(20) NOT NULL,
        IsCharity BIT NOT NULL DEFAULT 0,
        CharityPercent INT NULL,
        RegistrationOpenAt DATETIME2 NULL,
        RegistrationDeadline DATETIME2 NULL,
        StartTime DATETIME2 NOT NULL,
        EndTime DATETIME2 NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'DRAFT',
        RulesText NVARCHAR(MAX) NULL,
        RewardDescription NVARCHAR(MAX) NULL,
        DutchConfigJson NVARCHAR(MAX) NULL,
        SealedConfigJson NVARCHAR(MAX) NULL,
        PennyConfigJson NVARCHAR(MAX) NULL,
        AllowSellerSubmission BIT NOT NULL DEFAULT 1,
        CreatedBy BIGINT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NULL,
        Version BIGINT NOT NULL DEFAULT 0,
        CONSTRAINT FK_AuctionEvents_Users_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserId)
    );
END
GO

IF OBJECT_ID('dbo.EventProducts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EventProducts (
        EventProductId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        EventId BIGINT NOT NULL,
        ProductId BIGINT NULL,
        SourceType NVARCHAR(20) NOT NULL,
        SubmittedBySellerId BIGINT NOT NULL,
        ApprovalStatus NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
        RejectReason NVARCHAR(500) NULL,
        StartingPrice BIGINT NOT NULL,
        CurrentPrice BIGINT NOT NULL,
        PriceStep BIGINT NULL,
        ReservePrice BIGINT NULL,
        SessionStart DATETIME2 NULL,
        SessionEnd DATETIME2 NULL,
        SessionStatus NVARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
        WinnerId BIGINT NULL,
        FinalPrice BIGINT NULL,
        Version BIGINT NOT NULL DEFAULT 0,
        CONSTRAINT FK_EventProducts_AuctionEvents FOREIGN KEY (EventId) REFERENCES dbo.AuctionEvents(EventId),
        CONSTRAINT FK_EventProducts_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId),
        CONSTRAINT FK_EventProducts_Users_SubmittedBySeller FOREIGN KEY (SubmittedBySellerId) REFERENCES dbo.Users(UserId),
        CONSTRAINT FK_EventProducts_Users_Winner FOREIGN KEY (WinnerId) REFERENCES dbo.Users(UserId)
    );
    CREATE INDEX IX_EventProducts_EventId ON dbo.EventProducts(EventId);
    CREATE INDEX IX_EventProducts_ProductId ON dbo.EventProducts(ProductId);
END
GO

IF OBJECT_ID('dbo.EventRegistrations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EventRegistrations (
        RegistrationId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        EventId BIGINT NOT NULL,
        UserId BIGINT NOT NULL,
        Role NVARCHAR(20) NOT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
        RegisteredAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        NotifyOnOpen BIT NOT NULL DEFAULT 1,
        CONSTRAINT FK_EventRegistrations_AuctionEvents FOREIGN KEY (EventId) REFERENCES dbo.AuctionEvents(EventId),
        CONSTRAINT FK_EventRegistrations_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT UQ_EventRegistrations_Event_User UNIQUE (EventId, UserId)
    );
    CREATE INDEX IX_EventRegistrations_EventId ON dbo.EventRegistrations(EventId);
    CREATE INDEX IX_EventRegistrations_UserId ON dbo.EventRegistrations(UserId);
END
GO

IF OBJECT_ID('dbo.SealedBids', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SealedBids (
        SealedBidId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        EventProductId BIGINT NOT NULL,
        UserId BIGINT NOT NULL,
        BidAmount BIGINT NOT NULL,
        SubmittedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt DATETIME2 NULL,
        Revealed BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_SealedBids_EventProducts FOREIGN KEY (EventProductId) REFERENCES dbo.EventProducts(EventProductId),
        CONSTRAINT FK_SealedBids_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId),
        CONSTRAINT UQ_SealedBids_EventProduct_User UNIQUE (EventProductId, UserId)
    );
    CREATE INDEX IX_SealedBids_EventProductId ON dbo.SealedBids(EventProductId);
    CREATE INDEX IX_SealedBids_UserId ON dbo.SealedBids(UserId);
END
GO

IF OBJECT_ID('dbo.PennyBids', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PennyBids (
        PennyBidId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        EventProductId BIGINT NOT NULL,
        UserId BIGINT NOT NULL,
        PriceAfterBid BIGINT NOT NULL,
        BidAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_PennyBids_EventProducts FOREIGN KEY (EventProductId) REFERENCES dbo.EventProducts(EventProductId),
        CONSTRAINT FK_PennyBids_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserId)
    );
    CREATE INDEX IX_PennyBids_EventProductId ON dbo.PennyBids(EventProductId);
    CREATE INDEX IX_PennyBids_UserId ON dbo.PennyBids(UserId);
END
GO

/* --- MINIMAL SEED (roles + categories) ------------------------------------- */
MERGE dbo.Roles AS target
USING (VALUES (N'Admin'), (N'Staff'), (N'Seller'), (N'User')) AS source(RoleName)
ON target.RoleName = source.RoleName
WHEN NOT MATCHED THEN INSERT (RoleName) VALUES (source.RoleName);
GO

MERGE dbo.SystemSettings AS target
USING (VALUES
    (N'FRAUD_DETECTION_ENABLED', N'true'),
    (N'AUTO_RESTRICTION_ENABLED', N'false'),
    (N'FRAUD_ALERT_ENABLED', N'true')
) AS source(SettingKey, SettingValue)
ON target.SettingKey = source.SettingKey
WHEN NOT MATCHED THEN INSERT (SettingKey, SettingValue) VALUES (source.SettingKey, source.SettingValue);
GO

MERGE dbo.Categories AS target
USING (VALUES
    (N'Art', N'Artwork and paintings'),
    (N'Luxury Watch', N'Premium watches'),
    (N'Jewelry', N'Fine jewelry and gemstones'),
    (N'Automotive', N'Classic and collectible vehicles'),
    (N'Furniture', N'Designer and antique furniture'),
    (N'Ceramics', N'Porcelain, pottery, and decorative ceramics'),
    (N'Đồng hồ', N'Đồng hồ cao cấp, đồng hồ sưu tầm và phụ kiện liên quan'),
    (N'Đồ cổ', N'Đồ cổ, vật phẩm sưu tầm và hiện vật có giá trị lịch sử'),
    (N'Tranh nghệ thuật', N'Tranh vẽ, tác phẩm mỹ thuật và tranh trang trí'),
    (N'Trang sức', N'Trang sức, đá quý và phụ kiện cao cấp'),
    (N'Khác', N'Các sản phẩm đấu giá chưa thuộc danh mục cụ thể')
) AS source(CategoryName, Description)
ON target.CategoryName = source.CategoryName
WHEN NOT MATCHED THEN
    INSERT (CategoryName, Description, IsActive, CreatedAt)
    VALUES (source.CategoryName, source.Description, 1, SYSDATETIME());
GO

PRINT 'Schema ready: SWP_Nhom3_App';
PRINT 'Tables: Roles, Users, AuditLogs, IdentityDocuments, UserVerificationTokens, PasswordResetTokens,';
PRINT '        KycProfiles, Categories, Products, ProductImages, ProductApprovals, Contracts,';
PRINT '        CategoryAttributes, ProductAttributeValues, attribute_options, watchlist,';
PRINT '        Wallets, Transactions, WithdrawalRequests, Auctions, Auction_Deposits, Bids,';
PRINT '        SystemSettings, SystemSettingAuditLogs, FraudAlerts, Auction_Chat_Messages,';
PRINT '        Conversations, Messages, Notifications, FeaturedProducts';
GO

IF COL_LENGTH('Users', 'IsPremium') IS NULL
BEGIN
ALTER TABLE Users
    ADD IsPremium BIT NOT NULL CONSTRAINT DF_Users_IsPremium DEFAULT 0;
END;
GO

IF COL_LENGTH('Users', 'PremiumExpiresAt') IS NULL
BEGIN
ALTER TABLE Users
    ADD PremiumExpiresAt DATETIME2 NULL;
END;
GO