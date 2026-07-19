-- SQL Server migration: fraud detection and admin control.
IF COL_LENGTH('dbo.Users', 'BidRestrictedUntil') IS NULL ALTER TABLE dbo.Users ADD BidRestrictedUntil DATETIME2 NULL;
IF COL_LENGTH('dbo.Users', 'SuspendedAt') IS NULL ALTER TABLE dbo.Users ADD SuspendedAt DATETIME2 NULL;
IF COL_LENGTH('dbo.Users', 'SuspensionReason') IS NULL ALTER TABLE dbo.Users ADD SuspensionReason NVARCHAR(500) NULL;
IF COL_LENGTH('dbo.Users', 'BannedAt') IS NULL ALTER TABLE dbo.Users ADD BannedAt DATETIME2 NULL;
IF COL_LENGTH('dbo.Users', 'BannedBy') IS NULL ALTER TABLE dbo.Users ADD BannedBy BIGINT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Users_BannedBy')
    ALTER TABLE dbo.Users ADD CONSTRAINT FK_Users_BannedBy FOREIGN KEY (BannedBy) REFERENCES dbo.Users(UserId);
GO

IF COL_LENGTH('dbo.Bids', 'IpAddress') IS NULL ALTER TABLE dbo.Bids ADD IpAddress NVARCHAR(64) NULL;
IF COL_LENGTH('dbo.Bids', 'DeviceHash') IS NULL ALTER TABLE dbo.Bids ADD DeviceHash NVARCHAR(64) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bids_Auction_Time' AND object_id = OBJECT_ID('dbo.Bids'))
    CREATE INDEX IX_Bids_Auction_Time ON dbo.Bids(AuctionId, BidTime DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bids_Auction_Ip_Time' AND object_id = OBJECT_ID('dbo.Bids'))
    CREATE INDEX IX_Bids_Auction_Ip_Time ON dbo.Bids(AuctionId, IpAddress, BidTime DESC);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bids_Auction_Device' AND object_id = OBJECT_ID('dbo.Bids'))
    CREATE INDEX IX_Bids_Auction_Device ON dbo.Bids(AuctionId, DeviceHash);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Bids_User_Time' AND object_id = OBJECT_ID('dbo.Bids'))
    CREATE INDEX IX_Bids_User_Time ON dbo.Bids(UserId, BidTime DESC);
GO

IF OBJECT_ID('dbo.SystemSettings', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.SystemSettings (
        SettingId BIGINT IDENTITY(1,1) PRIMARY KEY,
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
        SettingAuditId BIGINT IDENTITY(1,1) PRIMARY KEY,
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
        FraudAlertId BIGINT IDENTITY(1,1) PRIMARY KEY,
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

MERGE dbo.SystemSettings AS target
USING (VALUES
    (N'FRAUD_DETECTION_ENABLED', N'true'),
    (N'AUTO_RESTRICTION_ENABLED', N'false'),
    (N'FRAUD_ALERT_ENABLED', N'true')
) AS source(SettingKey, SettingValue)
ON target.SettingKey = source.SettingKey
WHEN NOT MATCHED THEN INSERT (SettingKey, SettingValue) VALUES (source.SettingKey, source.SettingValue);
GO
