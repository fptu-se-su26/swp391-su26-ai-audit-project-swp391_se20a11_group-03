-- =============================================================================
-- Seed 20 TIMED auctions staggered ~2 hours apart ([SEED-STAGGER] prefix)
--
-- Run: sqlcmd -S localhost -U sa -P <password> -d SWP_Nhom3_App -i seed_staggered_auctions.sql
-- Product titles/descriptions use ASCII Vietnamese (no diacritics) to avoid sqlcmd encoding issues on Windows.
--
-- Prerequisite: SWP_Nhom3_App_full_schema.sql + seed_test_accounts.sql
-- Safe to re-run: skips existing [SEED-STAGGER] product names
-- =============================================================================
USE SWP_Nhom3_App;
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

DECLARE @Now          DATETIME2 = SYSDATETIME();
DECLARE @TimedDuration BIGINT   = 28800; -- 8 hours

DECLARE @SellerId BIGINT = (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'seller@gmail.com');
IF @SellerId IS NULL
    SET @SellerId = (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'seller1@gmail.com');
IF @SellerId IS NULL
BEGIN
    RAISERROR(N'seller@gmail.com not found. Run seed_test_accounts.sql first.', 16, 1);
    RETURN;
END;

DECLARE @StaffId BIGINT = COALESCE(
    (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'admin@gmail.com'),
    (SELECT TOP 1 UserId FROM dbo.Users WHERE Email = N'staff@example.com')
);

DECLARE @CatWatch     INT = COALESCE((SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Luxury Watch'), 2);
DECLARE @CatArt       INT = COALESCE((SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Art'), 1);
DECLARE @CatJewelry   INT = COALESCE((SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Jewelry'), 3);
DECLARE @CatAuto      INT = COALESCE((SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Automotive'), 4);
DECLARE @CatFurniture INT = COALESCE((SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Furniture'), 5);
DECLARE @CatCeramics  INT = COALESCE((SELECT TOP 1 CategoryId FROM dbo.Categories WHERE CategoryName = N'Ceramics'), 6);
DECLARE @CatDefault   INT = COALESCE(@CatWatch, (SELECT TOP 1 CategoryId FROM dbo.Categories ORDER BY CategoryId));

DECLARE @Lots TABLE (
    LotNum        INT           NOT NULL PRIMARY KEY,
    ProductName   NVARCHAR(255) NOT NULL,
    CategoryId    INT           NOT NULL,
    Description   NVARCHAR(500) NOT NULL,
    Brand         NVARCHAR(150) NULL,
    StartingPrice BIGINT        NOT NULL
);

INSERT INTO @Lots (LotNum, ProductName, CategoryId, Description, Brand, StartingPrice) VALUES
    ( 1, N'[SEED-STAGGER] Lot 01 - Longines Heritage Classic',        @CatWatch,     N'Dong ho co Longines Heritage, mat trang, day da nau.', N'Longines',           15000000),
    ( 2, N'[SEED-STAGGER] Lot 02 - Tranh son dau phong canh',       @CatArt,       N'Tranh son dau 80x100cm, khung go mun.', NULL,                  28000000),
    ( 3, N'[SEED-STAGGER] Lot 03 - Nhan sapphire xanh 3ct',         @CatJewelry,   N'Nhan vang trang 18K, da sapphire Ceylon.', NULL,                  35000000),
    ( 4, N'[SEED-STAGGER] Lot 04 - BMW 320i E46 2003',              @CatAuto,      N'BMW 320i sedan, noi that da, bao duong day du.', N'BMW',                45000000),
    ( 5, N'[SEED-STAGGER] Lot 05 - Ghe Barcelona thiet ke',        @CatFurniture, N'Ghe Barcelona boc da den, khung thep ma chrome.', N'Knoll',              55000000),
    ( 6, N'[SEED-STAGGER] Lot 06 - Binh hoa men lam Bat Trang',     @CatCeramics,  N'Binh hoa men lam thoi Nguyen, nguyen ven.', N'Bat Trang',          65000000),
    ( 7, N'[SEED-STAGGER] Lot 07 - Rolex Datejust 41',               @CatWatch,     N'Rolex Datejust 41mm, thep vang Rolesor, hop sach.', N'Rolex',              85000000),
    ( 8, N'[SEED-STAGGER] Lot 08 - Tranh in gioi han Picasso',       @CatArt,       N'Ban in co so thu tu, khung museum glass.', NULL,                  95000000),
    ( 9, N'[SEED-STAGGER] Lot 09 - Vong co ngoc trai South Sea',     @CatJewelry,   N'Chuoi ngoc trai vang 12-14mm, khoa vang 18K.', NULL,                 120000000),
    (10, N'[SEED-STAGGER] Lot 10 - Mercedes-Benz W113 Pagoda',       @CatAuto,      N'Mercedes 280SL Pagoda, mau xanh classic.', N'Mercedes-Benz',     150000000),
    (11, N'[SEED-STAGGER] Lot 11 - Ban go oc cho George III',       @CatFurniture, N'Ban console go oc cho khac tay the ky 18.', NULL,                 180000000),
    (12, N'[SEED-STAGGER] Lot 12 - Gom Satsuma Nhat Ban',            @CatCeramics,  N'Binh doi Satsuma men vang, thoi Meiji.', NULL,                 220000000),
    (13, N'[SEED-STAGGER] Lot 13 - Audemars Piguet Royal Oak',       @CatWatch,     N'AP Royal Oak 15500ST, thep khong gi, full set.', N'Audemars Piguet',   280000000),
    (14, N'[SEED-STAGGER] Lot 14 - Tranh thuy mac thieu nu',        @CatArt,       N'Tranh thuy mac tren lua, co tho tong.', NULL,                 320000000),
    (15, N'[SEED-STAGGER] Lot 15 - Kim cuong solitaire 2ct',        @CatJewelry,   N'Nhan kim cuong GIA 2.01ct, VS1, vang trang.', NULL,                 380000000),
    (16, N'[SEED-STAGGER] Lot 16 - Porsche 911 Carrera 1987',       @CatAuto,      N'Porsche 911 Carrera G50, mau do Guards.', N'Porsche',           420000000),
    (17, N'[SEED-STAGGER] Lot 17 - Den chum pha le Bohemian',       @CatDefault,   N'Den chum pha le Bohemian 12 nhanh, the ky 19.', NULL,                 480000000),
    (18, N'[SEED-STAGGER] Lot 18 - Dong xu vang co trieu Nguyen',   @CatDefault,   N'Bo 5 dong xu vang Bao Dai, nguyen seal.', NULL,                 550000000),
    (19, N'[SEED-STAGGER] Lot 19 - Patek Philippe Nautilus',        @CatWatch,     N'Patek Nautilus 5711/1A, thep, hop sach day du.', N'Patek Philippe',    720000000),
    (20, N'[SEED-STAGGER] Lot 20 - Tuong dong Art Deco',            @CatArt,       N'Tuong dong patina Art Deco Phap, cao 45cm.', NULL,                 850000000);

INSERT INTO dbo.Products (
    SellerId, CategoryId, ProductName, Description, ImagesUrl,
    [Condition], Brand, Origin, WeightSize,
    StartingPrice, StepPrice, TaxPercent, Status,
    AuctionMode, ScheduledStartTime, ScheduledDurationSeconds,
    SubmittedAt, CreatedAt
)
SELECT
    @SellerId, l.CategoryId, l.ProductName, l.Description, N'[]',
    N'LIKE_NEW', l.Brand, N'Việt Nam', N'Tiêu chuẩn',
    l.StartingPrice,
    CASE
        WHEN l.StartingPrice < 100000000  THEN 5000000
        WHEN l.StartingPrice < 1000000000 THEN 10000000
        ELSE 50000000
    END,
    5, N'APPROVED', N'TIMED',
    DATEADD(HOUR, 2 * (l.LotNum - 1) + 1, @Now),
    @TimedDuration,
    @Now, @Now
FROM @Lots l
WHERE NOT EXISTS (SELECT 1 FROM dbo.Products x WHERE x.ProductName = l.ProductName);

INSERT INTO dbo.ProductImages (ProductId, ImageUrl, IsPrimary)
SELECT pr.ProductId,
       N'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80',
       1
FROM dbo.Products pr
INNER JOIN @Lots l ON l.ProductName = pr.ProductName
WHERE NOT EXISTS (SELECT 1 FROM dbo.ProductImages pi WHERE pi.ProductId = pr.ProductId);

INSERT INTO dbo.ProductApprovals (ProductId, ReviewedBy, Status, Reason, ReviewedAt)
SELECT pr.ProductId, @StaffId, N'APPROVED', N'Seed staggered auction', @Now
FROM dbo.Products pr
INNER JOIN @Lots l ON l.ProductName = pr.ProductName
WHERE NOT EXISTS (SELECT 1 FROM dbo.ProductApprovals pa WHERE pa.ProductId = pr.ProductId);

INSERT INTO dbo.Contracts (ContractType, ReferenceId, FileUrl, CreatedAt)
SELECT N'LISTING', pr.ProductId,
       N'/uploads/contracts/listing-stagger-' + CAST(pr.ProductId AS NVARCHAR(20)) + N'.pdf', @Now
FROM dbo.Products pr
INNER JOIN @Lots l ON l.ProductName = pr.ProductName
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Contracts c
    WHERE c.ContractType = N'LISTING' AND c.ReferenceId = pr.ProductId
);

INSERT INTO dbo.Auctions (
    ProductId, AuctionMode, ScheduledDurationSeconds,
    StartTime, EndTime,
    CurrentHighestBid, CurrentWinnerUserId,
    Status, PaymentStatus, CreatedAt
)
SELECT
    pr.ProductId, N'TIMED', @TimedDuration,
    DATEADD(HOUR, 2 * (l.LotNum - 1) + 1, @Now),
    DATEADD(SECOND, @TimedDuration, DATEADD(HOUR, 2 * (l.LotNum - 1) + 1, @Now)),
    pr.StartingPrice, NULL,
    N'UPCOMING', NULL, @Now
FROM dbo.Products pr
INNER JOIN @Lots l ON l.ProductName = pr.ProductName
WHERE NOT EXISTS (SELECT 1 FROM dbo.Auctions a WHERE a.ProductId = pr.ProductId);

DECLARE @Inserted INT = (
    SELECT COUNT(*) FROM dbo.Products pr
    INNER JOIN @Lots l ON l.ProductName = pr.ProductName
);

DECLARE @Auctions INT = (
    SELECT COUNT(*) FROM dbo.Auctions a
    INNER JOIN dbo.Products pr ON pr.ProductId = a.ProductId
    INNER JOIN @Lots l ON l.ProductName = pr.ProductName
    WHERE a.Status = N'UPCOMING'
);

PRINT N'[SEED-STAGGER] Products in catalog: ' + CAST(@Inserted AS NVARCHAR(10));
PRINT N'[SEED-STAGGER] UPCOMING auctions: ' + CAST(@Auctions AS NVARCHAR(10));
GO
