USE SWP_Nhom3;
GO

-- Demo user + wallet (only if missing)
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = N'demo_dashboard')
BEGIN
    DECLARE @RoleId INT = (SELECT TOP 1 RoleId FROM Roles WHERE RoleName = N'User');
    IF @RoleId IS NOT NULL
    BEGIN
        INSERT INTO Users (RoleId, Username, Email, AuthProvider, Status, CreatedAt)
        VALUES (@RoleId, N'demo_dashboard', N'demo.dashboard@example.com', N'LOCAL', N'ACTIVE', SYSDATETIME());
    END
END
GO

IF NOT EXISTS (SELECT 1 FROM Wallets w INNER JOIN Users u ON w.UserId = u.UserId WHERE u.Username = N'demo_dashboard')
BEGIN
    DECLARE @UserId BIGINT = (SELECT TOP 1 UserId FROM Users WHERE Username = N'demo_dashboard');
    IF @UserId IS NOT NULL
    BEGIN
        INSERT INTO Wallets (UserId, Balance, HoldBalance, UpdatedAt)
        VALUES (@UserId, 0, 0, SYSDATETIME());
    END
END
GO

-- Sample transactions for dashboard testing
IF NOT EXISTS (SELECT 1 FROM Transactions WHERE TransactionType = N'PAY_AUCTION')
BEGIN
    DECLARE @WalletId BIGINT = (
        SELECT TOP 1 w.WalletId
        FROM Wallets w
        INNER JOIN Users u ON w.UserId = u.UserId
        WHERE u.Username IN (N'admin', N'seller_thuhuong', N'demo_dashboard')
        ORDER BY w.WalletId
    );

    IF @WalletId IS NOT NULL
    BEGIN
        INSERT INTO Transactions (WalletId, Amount, TransactionType, Status, CreatedAt)
        VALUES
            (@WalletId, 15000000, N'PAY_AUCTION', N'COMPLETED', DATEADD(day, -10, GETDATE())),
            (@WalletId, 5000000,  N'PAY_AUCTION', N'COMPLETED', DATEADD(day, -8, GETDATE())),
            (@WalletId, 8000000,  N'PAY_AUCTION', N'FAILED',    DATEADD(day, -7, GETDATE())),
            (@WalletId, 20000000, N'PAY_AUCTION', N'COMPLETED', DATEADD(day, -5, GETDATE())),
            (@WalletId, 7000000,  N'DEPOSIT',     N'COMPLETED', DATEADD(day, -4, GETDATE())),
            (@WalletId, 12000000, N'PAY_AUCTION', N'COMPLETED', DATEADD(day, -2, GETDATE()));
    END
END
GO

SELECT t.TransactionId, u.Username, t.Amount, t.TransactionType, t.Status, t.CreatedAt
FROM Transactions t
INNER JOIN Wallets w ON t.WalletId = w.WalletId
INNER JOIN Users u ON w.UserId = u.UserId
ORDER BY t.CreatedAt DESC;
