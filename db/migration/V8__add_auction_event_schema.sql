
-- =====================================================
-- V8__add_auction_event_schema.sql: Add Auction Event module tables and Product.IsLockedInEvent column (PostgreSQL/SQL Server compatible)
-- =====================================================

-- First add IsLockedInEvent to Products (SQL Server syntax)
IF COL_LENGTH('dbo.Products', 'IsLockedInEvent') IS NULL
BEGIN
    ALTER TABLE dbo.Products 
    ADD IsLockedInEvent BIT NOT NULL DEFAULT 0;
END
GO

-- Create AuctionEvents table
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

-- Create EventProducts table
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

-- Create EventRegistrations table
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

-- Create SealedBids table
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

-- Create PennyBids table
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

PRINT 'V8__add_auction_event_schema.sql executed successfully!';
GO
