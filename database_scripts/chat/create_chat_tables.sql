USE SWP_Nhom3;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Conversations')
BEGIN
    CREATE TABLE Conversations (
        ConversationId     BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId             BIGINT NOT NULL,
        AssignedStaff      BIGINT NULL,
        SellerId           BIGINT NULL,
        ProductId          BIGINT NULL,
        ConversationType   NVARCHAR(30) NOT NULL DEFAULT 'BUYER_STAFF',
        Subject            NVARCHAR(255) NOT NULL,
        Status             NVARCHAR(30) NOT NULL DEFAULT 'OPEN',
        CreatedAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt          DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        FOREIGN KEY (UserId)        REFERENCES Users(UserId),
        FOREIGN KEY (AssignedStaff) REFERENCES Users(UserId),
        FOREIGN KEY (SellerId)      REFERENCES Users(UserId),
        FOREIGN KEY (ProductId)     REFERENCES Products(ProductId)
    );
    PRINT 'Created table: Conversations';
END
ELSE
BEGIN
    -- Migration: ensure new columns exist for existing databases
    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Conversations') AND name = 'ConversationType')
        ALTER TABLE Conversations ADD ConversationType NVARCHAR(30) NOT NULL CONSTRAINT DF_Conversations_ConversationType DEFAULT 'BUYER_STAFF';

    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Conversations') AND name = 'SellerId')
        ALTER TABLE Conversations ADD SellerId BIGINT NULL;

    IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('Conversations') AND name = 'ProductId')
        ALTER TABLE Conversations ADD ProductId BIGINT NULL;

    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Conversations_SellerId')
        ALTER TABLE Conversations ADD CONSTRAINT FK_Conversations_SellerId FOREIGN KEY (SellerId) REFERENCES Users(UserId);

    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Conversations_ProductId')
        ALTER TABLE Conversations ADD CONSTRAINT FK_Conversations_ProductId FOREIGN KEY (ProductId) REFERENCES Products(ProductId);

    PRINT 'Table Conversations already exists - ensured new columns';
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Messages')
BEGIN
    CREATE TABLE Messages (
        MessageId      BIGINT IDENTITY(1,1) PRIMARY KEY,
        ConversationId BIGINT NOT NULL,
        SenderId       BIGINT NOT NULL,
        Content        NVARCHAR(MAX) NOT NULL,
        IsRead         BIT NOT NULL DEFAULT 0,
        SentAt         DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        FOREIGN KEY (ConversationId) REFERENCES Conversations(ConversationId),
        FOREIGN KEY (SenderId)       REFERENCES Users(UserId)
    );
    PRINT 'Created table: Messages';
END
ELSE
    PRINT 'Table Messages already exists';
GO

-- Verify all tables
SELECT name FROM sys.tables ORDER BY name;
GO