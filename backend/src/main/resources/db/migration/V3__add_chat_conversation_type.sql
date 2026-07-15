-- ============================================================
-- V3__add_chat_conversation_type.sql
-- Chat module: support Buyer<->Seller direct messaging.
-- Creates Conversations table if it does NOT exist (fresh install)
-- and adds the new columns + foreign keys (upgrade from V1/V2).
-- ============================================================

-- 1) Create table if missing
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Conversations')
BEGIN
    CREATE TABLE Conversations (
        ConversationId     BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId             BIGINT NOT NULL,
        AssignedStaff      BIGINT NULL,
        SellerId           BIGINT NULL,
        ProductId          BIGINT NULL,
        ConversationType   NVARCHAR(30) NOT NULL CONSTRAINT DF_Conversations_ConversationType DEFAULT 'BUYER_STAFF',
        Subject            NVARCHAR(255) NOT NULL,
        Status             NVARCHAR(30) NOT NULL DEFAULT 'OPEN',
        CreatedAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
    PRINT 'Created table: Conversations';
END
GO

-- 2) Add columns if missing (idempotent)
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Conversations') AND name = 'ConversationType')
    ALTER TABLE Conversations ADD ConversationType NVARCHAR(30) NOT NULL CONSTRAINT DF_Conversations_ConversationType DEFAULT 'BUYER_STAFF';
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Conversations') AND name = 'SellerId')
    ALTER TABLE Conversations ADD SellerId BIGINT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Conversations') AND name = 'ProductId')
    ALTER TABLE Conversations ADD ProductId BIGINT NULL;
GO

-- 3) Add foreign keys if missing
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Conversations_UserId')
    ALTER TABLE Conversations ADD CONSTRAINT FK_Conversations_UserId FOREIGN KEY (UserId) REFERENCES Users(UserId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Conversations_AssignedStaff')
    ALTER TABLE Conversations ADD CONSTRAINT FK_Conversations_AssignedStaff FOREIGN KEY (AssignedStaff) REFERENCES Users(UserId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Conversations_SellerId')
    ALTER TABLE Conversations ADD CONSTRAINT FK_Conversations_SellerId FOREIGN KEY (SellerId) REFERENCES Users(UserId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Conversations_ProductId')
    ALTER TABLE Conversations ADD CONSTRAINT FK_Conversations_ProductId FOREIGN KEY (ProductId) REFERENCES Products(ProductId);
GO

-- 4) Create Messages table if missing
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Messages')
BEGIN
    CREATE TABLE Messages (
        MessageId      BIGINT IDENTITY(1,1) PRIMARY KEY,
        ConversationId BIGINT NOT NULL,
        SenderId       BIGINT NOT NULL,
        Content        NVARCHAR(MAX) NOT NULL,
        IsRead         BIT NOT NULL DEFAULT 0,
        SentAt         DATETIME2 NOT NULL DEFAULT SYSDATETIME()
    );
    PRINT 'Created table: Messages';
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Messages_ConversationId')
    ALTER TABLE Messages ADD CONSTRAINT FK_Messages_ConversationId FOREIGN KEY (ConversationId) REFERENCES Conversations(ConversationId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Messages_SenderId')
    ALTER TABLE Messages ADD CONSTRAINT FK_Messages_SenderId FOREIGN KEY (SenderId) REFERENCES Users(UserId);
GO

-- 5) Verify
SELECT name FROM sys.tables WHERE name IN ('Conversations', 'Messages') ORDER BY name;
GO
