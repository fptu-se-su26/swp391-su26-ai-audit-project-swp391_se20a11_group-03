IF OBJECT_ID('dbo.Wallets', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Wallets (
        WalletId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL UNIQUE,
        Balance BIGINT NOT NULL DEFAULT 0,
        HoldBalance BIGINT NOT NULL DEFAULT 0,
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Wallets_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserID)
    );
END;

IF OBJECT_ID('dbo.Transactions', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Transactions (
        TransactionId BIGINT IDENTITY(1,1) PRIMARY KEY,
        WalletId BIGINT NOT NULL,
        Amount BIGINT NOT NULL,
        TransactionType NVARCHAR(40) NOT NULL,
        Status NVARCHAR(30) NOT NULL,
        ReferenceCode NVARCHAR(120) NULL,
        Description NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_Transactions_Wallets FOREIGN KEY (WalletId) REFERENCES dbo.Wallets(WalletId)
    );
END;

IF OBJECT_ID('dbo.WithdrawalRequests', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.WithdrawalRequests (
        WithdrawalRequestId BIGINT IDENTITY(1,1) PRIMARY KEY,
        UserId INT NOT NULL,
        WalletId BIGINT NOT NULL,
        Amount BIGINT NOT NULL,
        BankName NVARCHAR(120) NOT NULL,
        AccountNumber NVARCHAR(60) NOT NULL,
        AccountName NVARCHAR(150) NOT NULL,
        Status NVARCHAR(30) NOT NULL,
        StaffNote NVARCHAR(500) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        CONSTRAINT FK_WithdrawalRequests_Users FOREIGN KEY (UserId) REFERENCES dbo.Users(UserID),
        CONSTRAINT FK_WithdrawalRequests_Wallets FOREIGN KEY (WalletId) REFERENCES dbo.Wallets(WalletId)
    );
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_Transactions_ReferenceCode'
      AND object_id = OBJECT_ID('dbo.Transactions')
)
BEGIN
    CREATE INDEX IX_Transactions_ReferenceCode ON dbo.Transactions(ReferenceCode);
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'IX_WithdrawalRequests_Status'
      AND object_id = OBJECT_ID('dbo.WithdrawalRequests')
)
BEGIN
    CREATE INDEX IX_WithdrawalRequests_Status ON dbo.WithdrawalRequests(Status, CreatedAt DESC);
END;
