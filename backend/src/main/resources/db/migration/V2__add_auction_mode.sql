-- ============================================================
-- V2__add_auction_mode.sql
-- Auction Module v1: add LIVE/TIMED mode, payment window, deposit settlement
-- Run once against SWP_Nhom3 (SQL Server).
-- Each ALTER must be in its own batch (separated by GO) for sys.columns
-- to see the new column before the next IF check.
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Auctions') AND name = 'AuctionMode')
    ALTER TABLE Auctions ADD AuctionMode NVARCHAR(10) NOT NULL CONSTRAINT DF_Auctions_AuctionMode DEFAULT 'TIMED';
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Auctions') AND name = 'ScheduledDurationSeconds')
    ALTER TABLE Auctions ADD ScheduledDurationSeconds BIGINT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Auctions') AND name = 'PaymentStatus')
    ALTER TABLE Auctions ADD PaymentStatus NVARCHAR(20) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Auctions') AND name = 'PaymentDeadline')
    ALTER TABLE Auctions ADD PaymentDeadline DATETIME NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Auctions') AND name = 'SettledAt')
    ALTER TABLE Auctions ADD SettledAt DATETIME NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Auction_Deposits') AND name = 'SettlementType')
    ALTER TABLE Auction_Deposits ADD SettlementType NVARCHAR(20) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Auction_Deposits') AND name = 'SettledAt')
    ALTER TABLE Auction_Deposits ADD SettledAt DATETIME NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'AuctionMode')
    ALTER TABLE Products ADD AuctionMode NVARCHAR(10) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'ScheduledStartTime')
    ALTER TABLE Products ADD ScheduledStartTime DATETIME NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Products') AND name = 'ScheduledDurationSeconds')
    ALTER TABLE Products ADD ScheduledDurationSeconds BIGINT NULL;
GO

-- AuctionMode column has DEFAULT 'TIMED', so existing Auctions are already backfilled.
