-- Read-only DB health check for SWP_Nhom3_App
USE SWP_Nhom3_App;
GO

SET NOCOUNT ON;

PRINT '=== Tables ===';
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME;

PRINT '=== KycProfiles columns ===';
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'KycProfiles'
ORDER BY ORDINAL_POSITION;

PRINT '=== Admin usernames (no duplicate admin) ===';
SELECT UserId, Username, Email, RoleId
FROM dbo.Users
WHERE Username IN (N'admin', N'admingmail', N'adminseed')
   OR Email LIKE N'%admin%'
ORDER BY UserId;

PRINT '=== Recent KYC submissions ===';
SELECT TOP 5 KycId, UserId, Status, SubmittedAt
FROM dbo.KycProfiles
ORDER BY SubmittedAt DESC;

PRINT '=== Wallet balances (test accounts) ===';
SELECT u.Email, w.Balance, w.HoldBalance, w.UpdatedAt
FROM dbo.Users u
JOIN dbo.Wallets w ON w.UserId = u.UserId
WHERE u.Email IN (N'user1@gmail.com', N'user2@gmail.com', N'seller@gmail.com', N'admin@gmail.com')
ORDER BY u.Email;

PRINT '=== Recent wallet transactions (user1@gmail.com) ===';
SELECT TOP 20 t.TransactionId, t.TransactionType, t.Amount, t.Description, t.CreatedAt
FROM dbo.Transactions t
JOIN dbo.Wallets w ON w.WalletId = t.WalletId
JOIN dbo.Users u ON u.UserId = w.UserId
WHERE u.Email = N'user1@gmail.com'
ORDER BY t.CreatedAt DESC;

PRINT '=== Auction payment status (recent) ===';
SELECT TOP 20 AuctionId, Status, PaymentStatus, CurrentWinnerUserId, CurrentHighestBid, SettledAt, PaymentDeadline
FROM dbo.Auctions
WHERE PaymentStatus IN (N'PAID', N'AWAITING_PAYMENT', N'FORFEITED', N'NO_WINNER')
   OR Status IN (N'PAID', N'AWAITING_PAYMENT', N'FORFEITED', N'ENDED')
ORDER BY SettledAt DESC;
