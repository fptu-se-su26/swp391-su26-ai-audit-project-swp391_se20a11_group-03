USE SWP_Nhom3;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Conversations')
BEGIN
    CREATE TABLE Conversations (
        ConversationId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId         BIGINT NOT NULL,
        AssignedStaff  BIGINT NULL,
        Subject        NVARCHAR(255) NOT NULL,
        Status         NVARCHAR(30) NOT NULL DEFAULT 'OPEN',
        CreatedAt      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        UpdatedAt      DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
        FOREIGN KEY (UserId)        REFERENCES Users(UserId),
        FOREIGN KEY (AssignedStaff) REFERENCES Users(UserId)
    );
    PRINT 'Created table: Conversations';
END
ELSE
    PRINT 'Table Conversations already exists';
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
