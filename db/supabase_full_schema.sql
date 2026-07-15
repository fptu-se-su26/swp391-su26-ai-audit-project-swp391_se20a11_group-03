-- =============================================================================
-- SWP_Nhom3_App — Full PostgreSQL schema for Supabase
-- Converted from SWP_Nhom3_App_full_schema.sql (SQL Server / T-SQL)
--
-- Usage:
--   1. Supabase Dashboard → SQL Editor → paste & Run
--      (hoặc: psql "$SUPABASE_DB_URL" -f supabase_full_schema.sql)
--   2. Update application.properties:
--        spring.datasource.url=jdbc:postgresql://db.<project-ref>.supabase.co:5432/postgres
--        spring.datasource.username=postgres
--        spring.datasource.password=<password>
--        spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
--
-- Notes vs SQL Server version:
--   - IDENTITY(1,1)      -> GENERATED ALWAYS AS IDENTITY
--   - NVARCHAR/NVARCHAR(MAX) -> VARCHAR/TEXT (Postgres is UTF-8 natively)
--   - DATETIME2 / SYSDATETIME() -> TIMESTAMPTZ / NOW()
--   - BIT                -> BOOLEAN
--   - MERGE seed         -> INSERT ... ON CONFLICT DO NOTHING
-- Safe to re-run: everything uses IF NOT EXISTS / ON CONFLICT.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- CORE: ROLES & USERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Roles (
    RoleId      INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    RoleName    VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Users (
    UserId                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    RoleId                  INT           NULL REFERENCES Roles(RoleId),
    Username                VARCHAR(255)  NULL,
    FullName                VARCHAR(150)  NOT NULL,
    Email                   VARCHAR(255)  NOT NULL UNIQUE,
    Phone                   VARCHAR(20)   NOT NULL UNIQUE,
    IdentityNumber          VARCHAR(20)   NULL,
    PasswordHash            VARCHAR(128)  NOT NULL,
    Salt                    VARCHAR(32)   NOT NULL,
    PasswordIterations      INT           NOT NULL,
    EmailVerified           BOOLEAN       NOT NULL DEFAULT FALSE,
    EmailVerifiedAt         TIMESTAMPTZ   NULL,
    IdentityVerified        BOOLEAN       NOT NULL DEFAULT FALSE,
    IdentityVerifiedAt      TIMESTAMPTZ   NULL,
    VerificationLevel       SMALLINT      NOT NULL DEFAULT 0,
    ProfileStatus           VARCHAR(30)   NOT NULL DEFAULT 'PENDING_PROFILE',
    IsActive                BOOLEAN       NOT NULL DEFAULT TRUE,
    AuthProvider            VARCHAR(30)   NOT NULL DEFAULT 'LOCAL',
    Status                  VARCHAR(30)   NOT NULL DEFAULT 'ACTIVE',
    PaymentStrikeCount      INT           NOT NULL DEFAULT 0,
    LockedByPaymentStrikes  BOOLEAN       NOT NULL DEFAULT FALSE,
    CreatedAt               TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Allow multiple NULL identity numbers; unique only when set
CREATE UNIQUE INDEX IF NOT EXISTS UX_Users_IdentityNumber_NotNull
    ON Users(IdentityNumber)
    WHERE IdentityNumber IS NOT NULL;

CREATE TABLE IF NOT EXISTS AuditLogs (
    AuditLogID  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Action      VARCHAR(30)   NOT NULL,
    Success     BOOLEAN       NOT NULL,
    Subject     VARCHAR(255)  NULL,
    Detail      VARCHAR(500)  NULL,
    IpAddress   VARCHAR(64)   NULL,
    UserAgent   VARCHAR(500)  NULL,
    CreatedAt   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS IdentityDocuments (
    IdentityDocumentID  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    UserID              BIGINT        NOT NULL REFERENCES Users(UserId),
    DocumentType        VARCHAR(20)   NOT NULL,
    DocumentNumber      VARCHAR(20)   NOT NULL,
    FullName            VARCHAR(150)  NOT NULL,
    DateOfBirth         DATE          NULL,
    FrontImagePath      VARCHAR(500)  NULL,
    BackImagePath       VARCHAR(500)  NULL,
    OcrProvider         VARCHAR(50)   NULL,
    OcrResultJson       TEXT          NULL,
    Status              VARCHAR(30)   NOT NULL,
    ReviewedBy          VARCHAR(100)  NULL,
    ReviewedAt          TIMESTAMPTZ   NULL,
    CreatedAt           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UpdatedAt           TIMESTAMPTZ   NULL
);

CREATE TABLE IF NOT EXISTS UserVerificationTokens (
    VerificationTokenID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    UserID              BIGINT        NOT NULL REFERENCES Users(UserId),
    TokenHash           VARCHAR(128)  NOT NULL,
    TokenType           VARCHAR(30)   NOT NULL,
    ExpiresAt           TIMESTAMPTZ   NOT NULL,
    UsedAt              TIMESTAMPTZ   NULL,
    CreatedAt           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS PasswordResetTokens (
    PasswordResetTokenID BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    UserID               BIGINT        NOT NULL REFERENCES Users(UserId),
    TokenHash            VARCHAR(128)  NOT NULL,
    ExpiresAt            TIMESTAMPTZ   NOT NULL,
    UsedAt               TIMESTAMPTZ   NULL,
    CreatedAt            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS KycProfiles (
    KycId            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    UserId           BIGINT        NOT NULL UNIQUE REFERENCES Users(UserId),
    Phone            VARCHAR(30)   NOT NULL,
    CccdNumber       VARCHAR(20)   NOT NULL,
    FullName         VARCHAR(255)  NOT NULL,
    Dob              DATE          NOT NULL,
    Gender           VARCHAR(20)   NOT NULL,
    IssueDate        DATE          NOT NULL,
    IssuePlace       VARCHAR(255)  NOT NULL,
    FrontImageUrl    VARCHAR(500)  NOT NULL,
    BackImageUrl     VARCHAR(500)  NOT NULL,
    SelfieImageUrl   VARCHAR(500)  NOT NULL,
    Status           VARCHAR(20)   NOT NULL,
    SubmittedAt      TIMESTAMPTZ   NOT NULL,
    ProcessedBy      BIGINT        NULL REFERENCES Users(UserId),
    ProcessedAt      TIMESTAMPTZ   NULL,
    RejectionReason  VARCHAR(500)  NULL
    -- CCCD may duplicate across accounts; staff review flags duplicates (no UNIQUE on CccdNumber)
);

-- ---------------------------------------------------------------------------
-- CATALOG: CATEGORIES & PRODUCTS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Categories (
    CategoryId    INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CategoryName  VARCHAR(100)  NOT NULL UNIQUE,
    Description   VARCHAR(500)  NULL,
    IsActive      BOOLEAN       NOT NULL DEFAULT TRUE,
    CreatedAt     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Products (
    ProductId                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    SellerId                   BIGINT        NOT NULL REFERENCES Users(UserId),
    CategoryId                 INT           NOT NULL REFERENCES Categories(CategoryId),
    ProductName                VARCHAR(255)  NOT NULL,
    Description                TEXT          NULL,
    ImagesUrl                  TEXT          NULL,
    Condition                  VARCHAR(100)  NULL,
    Brand                      VARCHAR(150)  NULL,
    Origin                     VARCHAR(150)  NULL,
    WeightSize                 VARCHAR(150)  NULL,
    StartingPrice              BIGINT        NOT NULL,
    StepPrice                  BIGINT        NOT NULL DEFAULT 1000000,
    TaxPercent                 INT           NOT NULL DEFAULT 5,
    Status                     VARCHAR(30)   NOT NULL DEFAULT 'PENDING',
    AuctionMode                VARCHAR(10)   NULL,
    ScheduledStartTime         TIMESTAMPTZ   NULL,
    ScheduledDurationSeconds   BIGINT        NULL,
    SubmittedAt                TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CreatedAt                  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    RejectionReason            VARCHAR(500)  NULL
);

CREATE TABLE IF NOT EXISTS ProductImages (
    ImageId     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ProductId   BIGINT        NOT NULL REFERENCES Products(ProductId),
    ImageUrl    VARCHAR(500)  NOT NULL,
    IsPrimary   BOOLEAN       NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS ProductApprovals (
    ApprovalId   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ProductId    BIGINT        NOT NULL REFERENCES Products(ProductId),
    ReviewedBy   BIGINT        NOT NULL REFERENCES Users(UserId),
    Status       VARCHAR(30)   NOT NULL,
    Reason       VARCHAR(500)  NULL,
    ReviewedAt   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Contracts (
    ContractId    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ContractType  VARCHAR(50)   NOT NULL,
    ReferenceId   BIGINT        NOT NULL,
    FileUrl       VARCHAR(500)  NOT NULL,
    CreatedAt     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS CategoryAttributes (
    AttributeId    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    CategoryId     INT           NOT NULL REFERENCES Categories(CategoryId),
    AttributeName  VARCHAR(100)  NOT NULL,
    DataType       VARCHAR(50)   NOT NULL,
    IsRequired     BOOLEAN       NOT NULL DEFAULT FALSE,
    DisplayOrder   INT           NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ProductAttributeValues (
    ValueId         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ProductId       BIGINT        NOT NULL REFERENCES Products(ProductId),
    AttributeId     BIGINT        NOT NULL REFERENCES CategoryAttributes(AttributeId),
    AttributeValue  VARCHAR(500)  NOT NULL
);

CREATE TABLE IF NOT EXISTS attribute_options (
    OptionId     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    AttributeId  BIGINT        NOT NULL REFERENCES CategoryAttributes(AttributeId),
    OptionValue  VARCHAR(100)  NOT NULL
);

-- JPA entity @Table(name = "watchlist")
CREATE TABLE IF NOT EXISTS watchlist (
    watchlist_id  INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id       BIGINT       NOT NULL REFERENCES Users(UserId),
    product_id    BIGINT       NOT NULL REFERENCES Products(ProductId),
    created_at    TIMESTAMPTZ  NULL
);

-- ---------------------------------------------------------------------------
-- WALLET
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Wallets (
    WalletId     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    UserId       BIGINT       NOT NULL UNIQUE REFERENCES Users(UserId),
    Balance      BIGINT       NOT NULL DEFAULT 0,
    HoldBalance  BIGINT       NOT NULL DEFAULT 0,
    UpdatedAt    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Transactions (
    TransactionId    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    WalletId         BIGINT        NOT NULL REFERENCES Wallets(WalletId),
    Amount           BIGINT        NOT NULL,
    TransactionType  VARCHAR(40)   NOT NULL,
    Status           VARCHAR(30)   NOT NULL,
    ReferenceCode    VARCHAR(120)  NULL,
    Description      VARCHAR(500)  NULL,
    CreatedAt        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IX_Transactions_ReferenceCode
    ON Transactions(ReferenceCode);

CREATE TABLE IF NOT EXISTS WithdrawalRequests (
    WithdrawalRequestId  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    UserId               BIGINT        NOT NULL REFERENCES Users(UserId),
    WalletId             BIGINT        NOT NULL REFERENCES Wallets(WalletId),
    Amount               BIGINT        NOT NULL,
    BankName             VARCHAR(120)  NOT NULL,
    AccountNumber        VARCHAR(60)   NOT NULL,
    AccountName          VARCHAR(150)  NOT NULL,
    Status               VARCHAR(30)   NOT NULL,
    StaffNote            VARCHAR(500)  NULL,
    CreatedAt            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UpdatedAt            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS IX_WithdrawalRequests_Status
    ON WithdrawalRequests(Status, CreatedAt DESC);

-- ---------------------------------------------------------------------------
-- AUCTIONS & BIDDING
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Auctions (
    AuctionId                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ProductId                  BIGINT       NOT NULL UNIQUE REFERENCES Products(ProductId),
    AuctionMode                VARCHAR(10)  NOT NULL DEFAULT 'TIMED',
    ScheduledDurationSeconds   BIGINT       NULL,
    StartTime                  TIMESTAMPTZ  NOT NULL,
    EndTime                    TIMESTAMPTZ  NOT NULL,
    CurrentHighestBid          BIGINT       NOT NULL DEFAULT 0,
    CurrentWinnerUserId        BIGINT       NULL REFERENCES Users(UserId),
    Status                     VARCHAR(30)  NOT NULL,
    PaymentStatus              VARCHAR(20)  NULL DEFAULT 'PENDING',
    PaymentDeadline            TIMESTAMPTZ  NULL,
    SettledAt                  TIMESTAMPTZ  NULL,
    CreatedAt                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Auction_Deposits (
    DepositId       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    AuctionId       BIGINT       NOT NULL REFERENCES Auctions(AuctionId),
    UserId          BIGINT       NOT NULL REFERENCES Users(UserId),
    DepositAmount   BIGINT       NOT NULL,
    Status          VARCHAR(30)  NOT NULL,
    SettlementType  VARCHAR(20)  NULL,
    SettledAt       TIMESTAMPTZ  NULL,
    CreatedAt       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT UQ_AuctionDeposits_Auction_User UNIQUE (AuctionId, UserId)
);

CREATE TABLE IF NOT EXISTS Bids (
    BidId      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    AuctionId  BIGINT       NOT NULL REFERENCES Auctions(AuctionId),
    UserId     BIGINT       NOT NULL REFERENCES Users(UserId),
    BidAmount  BIGINT       NOT NULL,
    BidTime    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Auction_Chat_Messages (
    MessageId  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    AuctionId  BIGINT         NOT NULL REFERENCES Auctions(AuctionId),
    SenderId   BIGINT         NOT NULL REFERENCES Users(UserId),
    Content    VARCHAR(1000)  NOT NULL,
    SentAt     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- CHAT (support)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Conversations (
    ConversationId    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    UserId            BIGINT        NOT NULL REFERENCES Users(UserId),
    AssignedStaff     BIGINT        NULL REFERENCES Users(UserId),
    SellerId          BIGINT        NULL REFERENCES Users(UserId),
    ProductId         BIGINT        NULL REFERENCES Products(ProductId),
    ConversationType  VARCHAR(30)   NOT NULL,
    subject           VARCHAR(255)  NOT NULL,
    status            VARCHAR(30)   NOT NULL,
    createdAt         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updatedAt         TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Messages (
    MessageId       BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ConversationId  BIGINT       NOT NULL REFERENCES Conversations(ConversationId),
    SenderId        BIGINT       NOT NULL REFERENCES Users(UserId),
    content         TEXT         NOT NULL,
    isRead          BOOLEAN      NOT NULL DEFAULT FALSE,
    sentAt          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS Notifications (
    NotificationId  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    UserId          BIGINT         NOT NULL REFERENCES Users(UserId),
    Title           VARCHAR(200)   NOT NULL,
    Message         VARCHAR(1000)  NOT NULL,
    Type            VARCHAR(50)    NOT NULL,
    ReferenceId     BIGINT         NULL,
    ReferenceType   VARCHAR(50)    NULL,
    IsRead          BOOLEAN        NOT NULL DEFAULT FALSE,
    CreatedAt       TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- FEATURED PRODUCTS (daily / weekly / monthly slots)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS FeaturedProducts (
    FeaturedId    BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    PeriodType    VARCHAR(10)  NOT NULL,
    ProductId     BIGINT       NOT NULL REFERENCES Products(ProductId),
    DisplayOrder  INT          NOT NULL,
    UpdatedAt     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UpdatedBy     BIGINT       NULL,
    CONSTRAINT UQ_Featured_Period_Order UNIQUE (PeriodType, DisplayOrder)
);

CREATE INDEX IF NOT EXISTS IX_FeaturedProducts_PeriodType
    ON FeaturedProducts(PeriodType);

-- ---------------------------------------------------------------------------
-- MINIMAL SEED (roles + categories)
-- ---------------------------------------------------------------------------
INSERT INTO Roles (RoleName) VALUES
    ('Admin'), ('Staff'), ('Seller'), ('User')
ON CONFLICT (RoleName) DO NOTHING;

INSERT INTO Categories (CategoryName, Description) VALUES
    ('Art',              'Artwork and paintings'),
    ('Luxury Watch',     'Premium watches'),
    ('Jewelry',          'Fine jewelry and gemstones'),
    ('Automotive',       'Classic and collectible vehicles'),
    ('Furniture',        'Designer and antique furniture'),
    ('Ceramics',         'Porcelain, pottery, and decorative ceramics'),
    ('Đồng hồ',          'Đồng hồ cao cấp, đồng hồ sưu tầm và phụ kiện liên quan'),
    ('Đồ cổ',            'Đồ cổ, vật phẩm sưu tầm và hiện vật có giá trị lịch sử'),
    ('Tranh nghệ thuật', 'Tranh vẽ, tác phẩm mỹ thuật và tranh trang trí'),
    ('Trang sức',        'Trang sức, đá quý và phụ kiện cao cấp'),
    ('Khác',             'Các sản phẩm đấu giá chưa thuộc danh mục cụ thể')
ON CONFLICT (CategoryName) DO NOTHING;

-- Done. Tables: Roles, Users, AuditLogs, IdentityDocuments, UserVerificationTokens,
-- PasswordResetTokens, KycProfiles, Categories, Products, ProductImages,
-- ProductApprovals, Contracts, CategoryAttributes, ProductAttributeValues,
-- attribute_options, watchlist, Wallets, Transactions, WithdrawalRequests,
-- Auctions, Auction_Deposits, Bids, Auction_Chat_Messages, Conversations,
-- Messages, Notifications, FeaturedProducts
