-- =============================================================================
-- Seed demo catalog: extra accounts, products, auctions (multi-state)
--
-- Covers test scenarios:
--   PENDING / REJECTED products  -> staff approval flow
--   UPCOMING auctions            -> /upcoming, watchlist
--   ACTIVE auctions + bids       -> /live, bidding, chat
--   AWAITING_PAYMENT             -> payment + contract sign
--   PAID / FORFEITED / NO_WINNER -> /results, /won-items, payment strikes
--
-- Password for new accounts: 123456 (same hash as seed_test_accounts.sql)
--
-- Run (SSMS or sqlcmd):
--   sqlcmd -S localhost -U sa -P <password> -d SWP_Nhom3_App -i seed_demo_catalog.sql
--
-- Safe to re-run: skips rows whose ProductName starts with [SEED]
-- Prerequisite: run SWP_Nhom3_App_full_schema.sql + seed_test_accounts.sql first
-- =============================================================================
USE SWP_Nhom3_App;
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

DECLARE @Salt         NVARCHAR(32)  = N'3ce68530b29081c9c64f38132eebf9f3';
DECLARE @PasswordHash NVARCHAR(128) = N'ed20bdc925310cb7a9db86e00b997942cd7c0dd36f8bb1fd4c2dfb700589dbc0';
DECLARE @Iterations   INT           = 120000;
DECLARE @Now          DATETIME2     = SYSDATETIME();

DECLARE @RoleAdmin  INT = (SELECT TOP 1 RoleId FROM dbo.Roles WHERE RoleName = N'Admin');
DECLARE @RoleStaff  INT = (SELECT TOP 1 RoleId FROM dbo.Roles WHERE RoleName = N'Staff');
DECLARE @RoleUser   INT = (SELECT TOP 1 RoleId FROM dbo.Roles WHERE RoleName = N'User');
DECLARE @RoleSeller INT = (SELECT TOP 1 RoleId FROM dbo.Roles WHERE RoleName = N'Seller');

IF @RoleSeller IS NULL
BEGIN
    RAISERROR(N'Missing Roles. Run SWP_Nhom3_App_full_schema.sql first.', 16, 1);
    RETURN;
END;

/* --- Helper: step price tiers (matches StepCalculator.java) ---------------- */
-- < 100M  -> 5M | 100M-1B -> 10M | >= 1B -> 50M

/* ========================================================================== */
/* 1. EXTRA TEST ACCOUNTS                                                     */
/* ========================================================================== */
DECLARE @ExtraUsers TABLE (
    Email          NVARCHAR(255) NOT NULL PRIMARY KEY,
    Username       NVARCHAR(255) NOT NULL,
    FullName       NVARCHAR(150) NOT NULL,
    Phone          NVARCHAR(20)  NOT NULL,
    IdentityNumber NVARCHAR(20)  NOT NULL,
    RoleId         INT           NOT NULL,
    CccdNumber     NVARCHAR(20)  NOT NULL,
    WalletBalance  BIGINT        NOT NULL
);

INSERT INTO @ExtraUsers VALUES
    (N'seller2@gmail.com',  N'seller2',  N'Demo Seller Two',   N'0913000002', N'SELLER2TEST02', @RoleSeller, N'001122002002', 80000000),
    (N'seller3@gmail.com',  N'seller3',  N'Demo Seller Three', N'0913000003', N'SELLER3TEST03', @RoleSeller, N'001122003003', 60000000),
    (N'bidder3@gmail.com',  N'bidder3',  N'Demo Bidder Three', N'0912000003', N'BIDDER3TEST03', @RoleUser,   N'001122004004', 100000000);

MERGE dbo.Users AS target
USING @ExtraUsers AS source
ON target.Email = source.Email
WHEN MATCHED THEN
    UPDATE SET
        RoleId = source.RoleId, Username = source.Username, FullName = source.FullName,
        Phone = source.Phone, IdentityNumber = source.IdentityNumber,
        PasswordHash = @PasswordHash, Salt = @Salt, PasswordIterations = @Iterations,
        EmailVerified = 1, EmailVerifiedAt = @Now,
        IdentityVerified = 1, IdentityVerifiedAt = @Now,
        VerificationLevel = 2, ProfileStatus = N'VERIFIED',
        IsActive = 1, AuthProvider = N'LOCAL', Status = N'ACTIVE',
        PaymentStrikeCount = 0, LockedByPaymentStrikes = 0
WHEN NOT MATCHED THEN
    INSERT (
        RoleId, Username, FullName, Email, Phone, IdentityNumber,
        PasswordHash, Salt, PasswordIterations,
        EmailVerified, EmailVerifiedAt, IdentityVerified, IdentityVerifiedAt,
        VerificationLevel, ProfileStatus, IsActive, AuthProvider, Status,
        PaymentStrikeCount, LockedByPaymentStrikes, CreatedAt
    )
    VALUES (
        source.RoleId, source.Username, source.FullName, source.Email, source.Phone, source.IdentityNumber,
        @PasswordHash, @Salt, @Iterations,
        1, @Now, 1, @Now,
        2, N'VERIFIED', 1, N'LOCAL', N'ACTIVE',
        0, 0, @Now
    );

/* KYC approved */
DELETE k FROM dbo.KycProfiles k
INNER JOIN dbo.Users u ON u.UserId = k.UserId
WHERE u.Email IN (SELECT Email FROM @ExtraUsers);

INSERT INTO dbo.KycProfiles (
    UserId, Phone, CccdNumber, FullName, Dob, Gender, IssueDate, IssuePlace,
    FrontImageUrl, BackImageUrl, SelfieImageUrl, Status, SubmittedAt, ProcessedAt
)
SELECT
    u.UserId, e.Phone, e.CccdNumber, e.FullName,
    CAST('1992-06-15' AS DATE), N'Nam', CAST('2019-03-10' AS DATE), N'Cuc Canh sat QLHC ve TTXH',
    N'/uploads/kyc/seed-front.jpg', N'/uploads/kyc/seed-back.jpg', N'/uploads/kyc/seed-selfie.jpg',
    N'APPROVED', @Now, @Now
FROM @ExtraUsers e
INNER JOIN dbo.Users u ON u.Email = e.Email;

/* Wallets */
MERGE dbo.Wallets AS target
USING (
    SELECT u.UserId, e.WalletBalance AS Balance
    FROM @ExtraUsers e
    INNER JOIN dbo.Users u ON u.Email = e.Email
) AS source
ON target.UserId = source.UserId
WHEN MATCHED THEN
    UPDATE SET Balance = source.Balance, HoldBalance = 0, UpdatedAt = @Now
WHEN NOT MATCHED THEN
    INSERT (UserId, Balance, HoldBalance, UpdatedAt)
    VALUES (source.UserId, source.Balance, 0, @Now);

/* Seller contracts */
INSERT INTO dbo.Contracts (ContractType, ReferenceId, FileUrl, CreatedAt)
SELECT N'SELLER_AGREEMENT', u.UserId,
       N'/uploads/contracts/seller-' + CAST(u.UserId AS NVARCHAR(20)) + N'-seed.pdf', @Now
FROM dbo.Users u
WHERE u.Email IN (N'seller2@gmail.com', N'seller3@gmail.com')
  AND NOT EXISTS (
      SELECT 1 FROM dbo.Contracts c
      WHERE c.ContractType = N'SELLER_AGREEMENT' AND c.ReferenceId = u.UserId
  );

/* ========================================================================== */
/* 2. RESOLVE REFERENCE IDS                                                   */
/* ========================================================================== */
DECLARE @Seller1Id  BIGINT = (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'seller@gmail.com');
DECLARE @Seller2Id  BIGINT = (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'seller2@gmail.com');
DECLARE @User1Id    BIGINT = (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'user1@gmail.com');
DECLARE @User2Id    BIGINT = (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'user2@gmail.com');
DECLARE @Bidder3Id  BIGINT = (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'bidder3@gmail.com');
DECLARE @StaffId    BIGINT = COALESCE(
    (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'staff@example.com'),
    (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'staff123@gmail.com'),
    (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'admin@gmail.com')
);

IF @Seller1Id IS NULL
    SET @Seller1Id = (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'seller1@gmail.com');
IF @Seller1Id IS NULL
BEGIN
    RAISERROR(N'No seller account found. Run seed_test_accounts.sql first.', 16, 1);
    RETURN;
END;
IF @User1Id IS NULL OR @User2Id IS NULL
BEGIN
    RAISERROR(N'user1@gmail.com / user2@gmail.com not found. Run seed_test_accounts.sql first.', 16, 1);
    RETURN;
END;

DECLARE @CatWatch      INT = (SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Luxury Watch');
DECLARE @CatArt        INT = (SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Art');
DECLARE @CatJewelry    INT = (SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Jewelry');
DECLARE @CatAuto       INT = (SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Automotive');
DECLARE @CatFurniture  INT = (SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Furniture');
DECLARE @CatCeramics   INT = (SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Ceramics');
DECLARE @CatDongHo     INT = (SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Đồng hồ');
DECLARE @CatTranh      INT = (SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Tranh nghệ thuật');
DECLARE @CatTrangSuc   INT = (SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Trang sức');
DECLARE @CatDoCo       INT = (SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Đồ cổ');

/* ========================================================================== */
/* 3. PRODUCTS (idempotent by [SEED] prefix)                                  */
/* ========================================================================== */
DECLARE @Products TABLE (
    ProductName   NVARCHAR(255) NOT NULL PRIMARY KEY,
    SellerId      BIGINT        NOT NULL,
    CategoryId    INT           NOT NULL,
    Description   NVARCHAR(MAX) NOT NULL,
    Condition     NVARCHAR(100) NOT NULL,
    Brand         NVARCHAR(150) NULL,
    StartingPrice BIGINT        NOT NULL,
    Status        NVARCHAR(30)  NOT NULL,
    AuctionMode   NVARCHAR(10)  NULL,
    RejectReason  NVARCHAR(500) NULL,
  -- auction scenario key (null = no auction)
    Scenario      NVARCHAR(30)  NULL
);

INSERT INTO @Products (ProductName, SellerId, CategoryId, Description, Condition, Brand, StartingPrice, Status, AuctionMode, RejectReason, Scenario) VALUES
    -- Staff approval queue
    (N'[SEED] PENDING - Đồng hồ Orient Star Vintage', @Seller1Id, @CatDongHo,
     N'Đồng hồ cơ nam, mặt số nguyên bản, dây da thay thế đồng bộ.', N'GOOD', N'Orient', 4500000, N'PENDING', NULL, NULL, NULL),
    (N'[SEED] PENDING - Tranh sơn dầu phố cổ', @Seller2Id, @CatTranh,
     N'Tranh sơn dầu 60x80cm, khung gỗ, chờ staff duyệt.', N'LIKE_NEW', NULL, 12000000, N'PENDING', NULL, NULL, NULL),

    -- Rejected (seller can edit & resubmit)
    (N'[SEED] REJECTED - Nhẫn kim cương không chứng nhận', @Seller1Id, @CatTrangSuc,
     N'Nhẫn vàng trắng, thiếu giấy GIA.', N'FAIR', NULL, 8500000, N'REJECTED', NULL,
     N'Thiếu chứng nhận xuất xứ đá quý. Vui lòng bổ sung GIA/IGI.', NULL),

    -- Upcoming auctions
    (N'[SEED] UPCOMING - Rolex Submariner Date 126610LN', @Seller1Id, @CatWatch,
     N'Rolex Submariner Date, hộp sách đầy đủ, mua authorized 2021.', N'LIKE_NEW', N'Rolex', 320000000, N'APPROVED', N'TIMED', NULL, N'UPCOMING'),
    (N'[SEED] UPCOMING LIVE - Tranh phố Hội An thuỷ mặc', @Seller2Id, @CatTranh,
     N'Tác phẩm thuỷ mặc trên lụa, có chữ ký nghệ sĩ.', N'GOOD', NULL, 28000000, N'APPROVED', N'LIVE', NULL, N'UPCOMING_LIVE'),
    (N'[SEED] UPCOMING - Bàn trà gỗ gụ ta cổ', @Seller2Id, @CatDoCo,
     N'Bàn trà nguyên khối, chạm hoa văn thủ công.', N'GOOD', NULL, 45000000, N'APPROVED', N'TIMED', NULL, N'UPCOMING'),

    -- Active auctions (bid now)
    (N'[SEED] ACTIVE - Omega Speedmaster Moonwatch', @Seller1Id, @CatWatch,
     N'Omega Speedmaster Professional, kính sapphire, full set.', N'LIKE_NEW', N'Omega', 95000000, N'APPROVED', N'TIMED', NULL, N'ACTIVE'),
    (N'[SEED] ACTIVE - Patek Philippe Calatrava', @Seller3Id, @CatDongHo,
     N'Patek Philippe vàng trắng, máy manual wind, hiếm.', N'EXCELLENT', N'Patek Philippe', 850000000, N'APPROVED', N'TIMED', NULL, N'ACTIVE_HIGH'),

    -- Ended — payment scenarios
    (N'[SEED] AWAITING PAYMENT - BMW E30 325i 1988', @Seller1Id, @CatAuto,
     N'BMW E30 restored, nội thất da beige, máy M20B25.', N'GOOD', N'BMW', 420000000, N'APPROVED', N'TIMED', NULL, N'AWAITING_PAYMENT'),
    (N'[SEED] PAID - Ferrari Testarossa 1989', @Seller3Id, @CatAuto,
     N'Ferrari Testarossa đỏ, bảo dưỡng định kỳ, sách service.', N'EXCELLENT', N'Ferrari', 1200000000, N'APPROVED', N'TIMED', NULL, N'PAID'),
    (N'[SEED] FORFEITED - Ruby Diamond Ring 3ct', @Seller1Id, @CatJewelry,
     N'Nhẫn ruby Burma + kim cương viền, chứng nhận GIA.', N'LIKE_NEW', NULL, 180000000, N'APPROVED', N'TIMED', NULL, N'FORFEITED'),
    (N'[SEED] ENDED NO BID - Gốm Bát Tràng men lam', @Seller2Id, @CatCeramics,
     N'Bình hoa men lam cổ, không sứt mẻ.', N'GOOD', N'Bát Tràng', 6500000, N'APPROVED', N'TIMED', NULL, N'NO_WINNER'),

    -- Approved but not yet scheduled (seller inventory)
    (N'[SEED] APPROVED - Eames Lounge Chair & Ottoman', @Seller2Id, @CatFurniture,
     N'Bộ ghế Eames Herman Miller, da đen, gỗ veneer.', N'LIKE_NEW', N'Herman Miller', 55000000, N'APPROVED', NULL, NULL, NULL),
    (N'[SEED] APPROVED - Diamond Tennis Bracelet 5ct', @Seller3Id, @CatJewelry,
     N'Vòng tay kim cương 5ct, vàng trắng 18K.', N'EXCELLENT', NULL, 220000000, N'APPROVED', NULL, NULL, NULL);

INSERT INTO dbo.Products (
    SellerId, CategoryId, ProductName, Description, ImagesUrl,
    [Condition], Brand, Origin, WeightSize,
    StartingPrice, StepPrice, TaxPercent, Status,
    AuctionMode, ScheduledStartTime, ScheduledDurationSeconds,
    SubmittedAt, CreatedAt, RejectionReason
)
SELECT
    p.SellerId, p.CategoryId, p.ProductName, p.Description, N'[]',
    p.Condition, p.Brand, N'Việt Nam', N'Tiêu chuẩn',
    p.StartingPrice,
    CASE
        WHEN p.StartingPrice < 100000000  THEN 5000000
        WHEN p.StartingPrice < 1000000000 THEN 10000000
        ELSE 50000000
    END,
    5, p.Status,
    p.AuctionMode,
    CASE p.Scenario
        WHEN N'UPCOMING'      THEN DATEADD(MINUTE, 45, @Now)
        WHEN N'UPCOMING_LIVE' THEN DATEADD(MINUTE, 30, @Now)
        WHEN N'ACTIVE'        THEN DATEADD(MINUTE, -20, @Now)
        WHEN N'ACTIVE_HIGH'   THEN DATEADD(MINUTE, -15, @Now)
        ELSE NULL
    END,
    CASE
        WHEN p.AuctionMode = N'LIVE'  THEN NULL
        WHEN p.Scenario IS NOT NULL   THEN 28800  -- 8 hours TIMED
        ELSE NULL
    END,
    @Now, @Now, p.RejectReason
FROM @Products p
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Products x WHERE x.ProductName = p.ProductName
);

/* Product images (placeholder) */
INSERT INTO dbo.ProductImages (ProductId, ImageUrl, IsPrimary)
SELECT pr.ProductId, N'/uploads/seed/product-' + CAST(pr.ProductId AS NVARCHAR(20)) + N'-1.jpg', 1
FROM dbo.Products pr
WHERE pr.ProductName LIKE N'[SEED]%'
  AND NOT EXISTS (SELECT 1 FROM dbo.ProductImages pi WHERE pi.ProductId = pr.ProductId);

/* Staff approval history for APPROVED/REJECTED seed products */
INSERT INTO dbo.ProductApprovals (ProductId, ReviewedBy, Status, Reason, ReviewedAt)
SELECT pr.ProductId, @StaffId, pr.Status,
       CASE WHEN pr.Status = N'REJECTED' THEN pr.RejectionReason ELSE N'Seed data approved' END,
       @Now
FROM dbo.Products pr
WHERE pr.ProductName LIKE N'[SEED]%'
  AND pr.Status IN (N'APPROVED', N'REJECTED')
  AND NOT EXISTS (SELECT 1 FROM dbo.ProductApprovals pa WHERE pa.ProductId = pr.ProductId);

/* Listing contracts for approved products */
INSERT INTO dbo.Contracts (ContractType, ReferenceId, FileUrl, CreatedAt)
SELECT N'LISTING', pr.ProductId,
       N'/uploads/contracts/listing-product-' + CAST(pr.ProductId AS NVARCHAR(20)) + N'.pdf', @Now
FROM dbo.Products pr
WHERE pr.ProductName LIKE N'[SEED]%'
  AND pr.Status = N'APPROVED'
  AND NOT EXISTS (
      SELECT 1 FROM dbo.Contracts c
      WHERE c.ContractType = N'LISTING' AND c.ReferenceId = pr.ProductId
  );

/* ========================================================================== */
/* 4. AUCTIONS                                                                */
/* ========================================================================== */
DECLARE @TimedDuration BIGINT = 28800; -- 8h
DECLARE @LiveDuration  BIGINT = 180;   -- 3min

INSERT INTO dbo.Auctions (
    ProductId, AuctionMode, ScheduledDurationSeconds,
    StartTime, EndTime,
    CurrentHighestBid, CurrentWinnerUserId,
    Status, PaymentStatus, PaymentDeadline, SettledAt, CreatedAt
)
SELECT
    pr.ProductId,
    COALESCE(pr.AuctionMode, N'TIMED'),
    CASE WHEN pr.AuctionMode = N'TIMED' THEN @TimedDuration ELSE NULL END,
    CASE s.Scenario
        WHEN N'UPCOMING'           THEN DATEADD(MINUTE, 45, @Now)
        WHEN N'UPCOMING_LIVE'      THEN DATEADD(MINUTE, 30, @Now)
        WHEN N'ACTIVE'             THEN DATEADD(MINUTE, -20, @Now)
        WHEN N'ACTIVE_HIGH'        THEN DATEADD(MINUTE, -15, @Now)
        WHEN N'AWAITING_PAYMENT'   THEN DATEADD(HOUR, -10, @Now)
        WHEN N'PAID'               THEN DATEADD(DAY, -3, @Now)
        WHEN N'FORFEITED'          THEN DATEADD(DAY, -5, @Now)
        WHEN N'NO_WINNER'          THEN DATEADD(HOUR, -12, @Now)
    END,
    CASE s.Scenario
        WHEN N'UPCOMING'           THEN DATEADD(SECOND, @TimedDuration, DATEADD(MINUTE, 45, @Now))
        WHEN N'UPCOMING_LIVE'      THEN DATEADD(SECOND, @LiveDuration, DATEADD(MINUTE, 30, @Now))
        WHEN N'ACTIVE'             THEN DATEADD(SECOND, @TimedDuration, DATEADD(MINUTE, -20, @Now))
        WHEN N'ACTIVE_HIGH'        THEN DATEADD(SECOND, @TimedDuration, DATEADD(MINUTE, -15, @Now))
        WHEN N'AWAITING_PAYMENT'   THEN DATEADD(HOUR, -2, @Now)
        WHEN N'PAID'               THEN DATEADD(DAY, -3, @Now) + CAST('08:00:00' AS DATETIME2)
        WHEN N'FORFEITED'          THEN DATEADD(DAY, -4, @Now)
        WHEN N'NO_WINNER'          THEN DATEADD(HOUR, -4, @Now)
    END,
    CASE s.Scenario
        WHEN N'ACTIVE'             THEN 110000000
        WHEN N'ACTIVE_HIGH'        THEN 870000000
        WHEN N'AWAITING_PAYMENT'   THEN 465000000
        WHEN N'PAID'               THEN 1250000000
        WHEN N'FORFEITED'          THEN 195000000
        ELSE pr.StartingPrice
    END,
    CASE s.Scenario
        WHEN N'ACTIVE'             THEN @User1Id
        WHEN N'ACTIVE_HIGH'        THEN @Bidder3Id
        WHEN N'AWAITING_PAYMENT'   THEN @User1Id
        WHEN N'PAID'               THEN @User2Id
        WHEN N'FORFEITED'          THEN @User1Id
        ELSE NULL
    END,
    CASE s.Scenario
        WHEN N'UPCOMING'           THEN N'UPCOMING'
        WHEN N'UPCOMING_LIVE'      THEN N'UPCOMING'
        WHEN N'ACTIVE'             THEN N'ACTIVE'
        WHEN N'ACTIVE_HIGH'        THEN N'ACTIVE'
        WHEN N'AWAITING_PAYMENT'   THEN N'AWAITING_PAYMENT'
        WHEN N'PAID'               THEN N'PAID'
        WHEN N'FORFEITED'          THEN N'FORFEITED'
        WHEN N'NO_WINNER'          THEN N'ENDED'
    END,
    CASE s.Scenario
        WHEN N'AWAITING_PAYMENT'   THEN N'AWAITING_PAYMENT'
        WHEN N'PAID'               THEN N'PAID'
        WHEN N'FORFEITED'          THEN N'FORFEITED'
        WHEN N'NO_WINNER'          THEN N'NO_WINNER'
        ELSE NULL
    END,
    CASE s.Scenario
        WHEN N'AWAITING_PAYMENT'   THEN DATEADD(DAY, 3, DATEADD(HOUR, -2, @Now))
        WHEN N'FORFEITED'          THEN DATEADD(DAY, -1, @Now)
        ELSE NULL
    END,
    CASE s.Scenario
        WHEN N'PAID'               THEN DATEADD(DAY, -2, @Now)
        WHEN N'FORFEITED'          THEN DATEADD(DAY, -1, @Now)
        WHEN N'NO_WINNER'          THEN DATEADD(HOUR, -4, @Now)
        ELSE NULL
    END,
    @Now
FROM dbo.Products pr
INNER JOIN @Products s ON s.ProductName = pr.ProductName
WHERE s.Scenario IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM dbo.Auctions a WHERE a.ProductId = pr.ProductId);

/* ========================================================================== */
/* 5. BIDS & DEPOSITS                                                         */
/* ========================================================================== */
-- ACTIVE auction bids
DECLARE @AuctionActiveId BIGINT = (
    SELECT TOP 1 a.AuctionId FROM dbo.Auctions a
    INNER JOIN dbo.Products p ON p.ProductId = a.ProductId
    WHERE p.ProductName = N'[SEED] ACTIVE - Omega Speedmaster Moonwatch'
);

IF @AuctionActiveId IS NOT NULL
BEGIN
    INSERT INTO dbo.Bids (AuctionId, UserId, BidAmount, BidTime)
    SELECT v.AuctionId, v.UserId, v.BidAmount, v.BidTime
    FROM (VALUES
        (@AuctionActiveId, @User2Id,   100000000, DATEADD(MINUTE, -18, @Now)),
        (@AuctionActiveId, @User1Id,   105000000, DATEADD(MINUTE, -12, @Now)),
        (@AuctionActiveId, @Bidder3Id, 110000000, DATEADD(MINUTE, -5, @Now))
    ) AS v(AuctionId, UserId, BidAmount, BidTime)
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Bids b
        WHERE b.AuctionId = v.AuctionId AND b.UserId = v.UserId AND b.BidAmount = v.BidAmount
    );

    INSERT INTO dbo.Auction_Deposits (AuctionId, UserId, DepositAmount, Status, CreatedAt)
    SELECT v.AuctionId, v.UserId, 9500000, N'LOCKED', @Now
    FROM (VALUES
        (@AuctionActiveId, @User1Id),
        (@AuctionActiveId, @User2Id),
        (@AuctionActiveId, @Bidder3Id)
    ) AS v(AuctionId, UserId)
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Auction_Deposits d
        WHERE d.AuctionId = v.AuctionId AND d.UserId = v.UserId
    );
END;

-- HIGH price active auction
DECLARE @AuctionHighId BIGINT = (
    SELECT TOP 1 a.AuctionId FROM dbo.Auctions a
    INNER JOIN dbo.Products p ON p.ProductId = a.ProductId
    WHERE p.ProductName = N'[SEED] ACTIVE - Patek Philippe Calatrava'
);

IF @AuctionHighId IS NOT NULL
BEGIN
    INSERT INTO dbo.Bids (AuctionId, UserId, BidAmount, BidTime)
    SELECT v.AuctionId, v.UserId, v.BidAmount, v.BidTime
    FROM (VALUES
        (@AuctionHighId, @User2Id,   860000000, DATEADD(MINUTE, -10, @Now)),
        (@AuctionHighId, @Bidder3Id, 870000000, DATEADD(MINUTE, -3, @Now))
    ) AS v(AuctionId, UserId, BidAmount, BidTime)
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Bids b
        WHERE b.AuctionId = v.AuctionId AND b.UserId = v.UserId AND b.BidAmount = v.BidAmount
    );
END;

-- AWAITING_PAYMENT auction history
DECLARE @AuctionPayId BIGINT = (
    SELECT TOP 1 a.AuctionId FROM dbo.Auctions a
    INNER JOIN dbo.Products p ON p.ProductId = a.ProductId
    WHERE p.ProductName = N'[SEED] AWAITING PAYMENT - BMW E30 325i 1988'
);

IF @AuctionPayId IS NOT NULL
BEGIN
    INSERT INTO dbo.Bids (AuctionId, UserId, BidAmount, BidTime)
    SELECT v.AuctionId, v.UserId, v.BidAmount, v.BidTime
    FROM (VALUES
        (@AuctionPayId, @User2Id, 430000000, DATEADD(HOUR, -8, @Now)),
        (@AuctionPayId, @User1Id, 465000000, DATEADD(HOUR, -3, @Now))
    ) AS v(AuctionId, UserId, BidAmount, BidTime)
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Bids b WHERE b.AuctionId = v.AuctionId
    );

    INSERT INTO dbo.Auction_Deposits (AuctionId, UserId, DepositAmount, Status, SettlementType, CreatedAt)
    SELECT @AuctionPayId, @User1Id, 42000000, N'HELD_FOR_PAYMENT', NULL, DATEADD(HOUR, -9, @Now)
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Auction_Deposits d WHERE d.AuctionId = @AuctionPayId AND d.UserId = @User1Id
    );

    INSERT INTO dbo.Contracts (ContractType, ReferenceId, FileUrl, CreatedAt)
    SELECT N'PURCHASE_AGREEMENT', @AuctionPayId,
           N'/uploads/contracts/purchase-auction-' + CAST(@AuctionPayId AS NVARCHAR(20)) + N'.pdf', @Now
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Contracts c
        WHERE c.ContractType = N'PURCHASE_AGREEMENT' AND c.ReferenceId = @AuctionPayId
    );
END;

-- PAID auction
DECLARE @AuctionPaidId BIGINT = (
    SELECT TOP 1 a.AuctionId FROM dbo.Auctions a
    INNER JOIN dbo.Products p ON p.ProductId = a.ProductId
    WHERE p.ProductName = N'[SEED] PAID - Ferrari Testarossa 1989'
);

IF @AuctionPaidId IS NOT NULL
BEGIN
    INSERT INTO dbo.Bids (AuctionId, UserId, BidAmount, BidTime)
    SELECT @AuctionPaidId, @User2Id, 1250000000, DATEADD(DAY, -3, @Now)
    WHERE NOT EXISTS (SELECT 1 FROM dbo.Bids b WHERE b.AuctionId = @AuctionPaidId);

    INSERT INTO dbo.Auction_Deposits (AuctionId, UserId, DepositAmount, Status, SettlementType, SettledAt, CreatedAt)
    SELECT @AuctionPaidId, @User2Id, 120000000, N'APPLIED_TO_PAYMENT', N'PAID', DATEADD(DAY, -2, @Now), DATEADD(DAY, -3, @Now)
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Auction_Deposits d WHERE d.AuctionId = @AuctionPaidId AND d.UserId = @User2Id
    );

    INSERT INTO dbo.Contracts (ContractType, ReferenceId, FileUrl, CreatedAt)
    SELECT N'PURCHASE_AGREEMENT', @AuctionPaidId,
           N'/uploads/contracts/purchase-auction-' + CAST(@AuctionPaidId AS NVARCHAR(20)) + N'-paid.pdf', DATEADD(DAY, -2, @Now)
    WHERE NOT EXISTS (
        SELECT 1 FROM dbo.Contracts c
        WHERE c.ContractType = N'PURCHASE_AGREEMENT' AND c.ReferenceId = @AuctionPaidId
    );
END;

/* ========================================================================== */
/* 6. WATCHLIST (user1 follows upcoming + active)                             */
/* ========================================================================== */
INSERT INTO dbo.watchlist (user_id, product_id, created_at)
SELECT @User1Id, pr.ProductId, @Now
FROM dbo.Products pr
WHERE pr.ProductName IN (
    N'[SEED] UPCOMING - Rolex Submariner Date 126610LN',
    N'[SEED] ACTIVE - Omega Speedmaster Moonwatch',
    N'[SEED] AWAITING PAYMENT - BMW E30 325i 1988'
)
AND NOT EXISTS (
    SELECT 1 FROM dbo.watchlist w
    WHERE w.user_id = @User1Id AND w.product_id = pr.ProductId
);

/* ========================================================================== */
/* 7. SUMMARY                                                                 */
/* ========================================================================== */
PRINT N'';
PRINT N'=== seed_demo_catalog.sql done ===';
PRINT N'New accounts (password 123456):';
PRINT N'  seller2@gmail.com  — Seller, 80M wallet';
PRINT N'  seller3@gmail.com  — Seller, 60M wallet';
PRINT N'  bidder3@gmail.com  — User, 100M wallet';
PRINT N'';
PRINT N'Seed products: 14 lots tagged [SEED]';
PRINT N'  2 PENDING | 1 REJECTED | 2 APPROVED (no auction)';
PRINT N'  3 UPCOMING | 2 ACTIVE | 1 AWAITING_PAYMENT | 1 PAID | 1 FORFEITED | 1 NO_WINNER';
PRINT N'';
GO

SELECT
    p.ProductId,
    p.ProductName,
    p.Status       AS ProductStatus,
    p.StartingPrice,
    a.AuctionId,
    a.Status       AS AuctionStatus,
    a.PaymentStatus,
    a.StartTime,
    a.EndTime,
    a.CurrentHighestBid,
    wu.Email       AS CurrentWinner
FROM dbo.Products p
LEFT JOIN dbo.Auctions a ON a.ProductId = p.ProductId
LEFT JOIN dbo.Users wu ON wu.UserId = a.CurrentWinnerUserId
WHERE p.ProductName LIKE N'[SEED]%'
ORDER BY p.ProductId;
GO

SELECT u.Email, r.RoleName, w.Balance
FROM dbo.Users u
LEFT JOIN dbo.Roles r ON r.RoleId = u.RoleId
LEFT JOIN dbo.Wallets w ON w.UserId = u.UserId
WHERE u.Email IN (
    N'seller2@gmail.com', N'seller3@gmail.com', N'bidder3@gmail.com',
    N'seller@gmail.com', N'user1@gmail.com', N'user2@gmail.com'
)
ORDER BY u.Email;
GO
