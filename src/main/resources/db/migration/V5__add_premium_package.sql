IF COL_LENGTH('dbo.Users', 'IsPremium') IS NULL
    ALTER TABLE dbo.Users ADD IsPremium BIT NOT NULL CONSTRAINT DF_Users_IsPremium DEFAULT 0;

IF OBJECT_ID('dbo.AppraisalRequests', 'U') IS NULL
CREATE TABLE dbo.AppraisalRequests (
    AppraisalRequestId BIGINT IDENTITY PRIMARY KEY,
    SellerId BIGINT NOT NULL,
    ProductId BIGINT NOT NULL,
    RequestDate DATETIME2 NOT NULL,
    Status VARCHAR(30) NOT NULL,
    RecommendedPrice BIGINT NULL,
    ExpertNote NVARCHAR(1000) NULL,
    CONSTRAINT FK_AppraisalRequests_Users FOREIGN KEY (SellerId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_AppraisalRequests_Products FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId)
);

IF OBJECT_ID('dbo.AutoBidConfigs', 'U') IS NULL
CREATE TABLE dbo.AutoBidConfigs (
    AutoBidConfigId BIGINT IDENTITY PRIMARY KEY,
    BuyerId BIGINT NOT NULL,
    AuctionId BIGINT NOT NULL,
    MaxPrice BIGINT NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_AutoBidConfigs_IsActive DEFAULT 1,
    CONSTRAINT UQ_AutoBidConfigs_BuyerAuction UNIQUE (BuyerId, AuctionId),
    CONSTRAINT FK_AutoBidConfigs_Users FOREIGN KEY (BuyerId) REFERENCES dbo.Users(UserId),
    CONSTRAINT FK_AutoBidConfigs_Auctions FOREIGN KEY (AuctionId) REFERENCES dbo.Auctions(AuctionId)
);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AutoBidConfigs_AuctionActive'
               AND object_id = OBJECT_ID('dbo.AutoBidConfigs'))
    CREATE INDEX IX_AutoBidConfigs_AuctionActive ON dbo.AutoBidConfigs(AuctionId, IsActive, MaxPrice DESC);
