-- =============================================================================
-- DROP ALL TABLES — use before SWP_Nhom3_App_full_schema.sql on existing DB
-- WARNING: Deletes ALL data in SWP_Nhom3_App
-- =============================================================================
USE SWP_Nhom3_App;
GO

IF OBJECT_ID('dbo.Auction_Chat_Messages', 'U') IS NOT NULL DROP TABLE dbo.Auction_Chat_Messages;
IF OBJECT_ID('dbo.Bids', 'U') IS NOT NULL DROP TABLE dbo.Bids;
IF OBJECT_ID('dbo.Auction_Deposits', 'U') IS NOT NULL DROP TABLE dbo.Auction_Deposits;
IF OBJECT_ID('dbo.Auctions', 'U') IS NOT NULL DROP TABLE dbo.Auctions;
IF OBJECT_ID('dbo.Messages', 'U') IS NOT NULL DROP TABLE dbo.Messages;
IF OBJECT_ID('dbo.Conversations', 'U') IS NOT NULL DROP TABLE dbo.Conversations;
IF OBJECT_ID('dbo.Notifications', 'U') IS NOT NULL DROP TABLE dbo.Notifications;
IF OBJECT_ID('dbo.ProductAttributeValues', 'U') IS NOT NULL DROP TABLE dbo.ProductAttributeValues;
IF OBJECT_ID('dbo.attribute_options', 'U') IS NOT NULL DROP TABLE dbo.attribute_options;
IF OBJECT_ID('dbo.CategoryAttributes', 'U') IS NOT NULL DROP TABLE dbo.CategoryAttributes;
IF OBJECT_ID('dbo.ProductApprovals', 'U') IS NOT NULL DROP TABLE dbo.ProductApprovals;
IF OBJECT_ID('dbo.ProductImages', 'U') IS NOT NULL DROP TABLE dbo.ProductImages;
IF OBJECT_ID('dbo.watchlist', 'U') IS NOT NULL DROP TABLE dbo.watchlist;
IF OBJECT_ID('dbo.Watchlist', 'U') IS NOT NULL DROP TABLE dbo.Watchlist;
IF OBJECT_ID('dbo.Contracts', 'U') IS NOT NULL DROP TABLE dbo.Contracts;
IF OBJECT_ID('dbo.WithdrawalRequests', 'U') IS NOT NULL DROP TABLE dbo.WithdrawalRequests;
IF OBJECT_ID('dbo.Transactions', 'U') IS NOT NULL DROP TABLE dbo.Transactions;
IF OBJECT_ID('dbo.Wallets', 'U') IS NOT NULL DROP TABLE dbo.Wallets;
IF OBJECT_ID('dbo.KycProfiles', 'U') IS NOT NULL DROP TABLE dbo.KycProfiles;
IF OBJECT_ID('dbo.IdentityDocuments', 'U') IS NOT NULL DROP TABLE dbo.IdentityDocuments;
IF OBJECT_ID('dbo.UserVerificationTokens', 'U') IS NOT NULL DROP TABLE dbo.UserVerificationTokens;
IF OBJECT_ID('dbo.PendingEmailVerifications', 'U') IS NOT NULL DROP TABLE dbo.PendingEmailVerifications;
IF OBJECT_ID('dbo.PasswordResetTokens', 'U') IS NOT NULL DROP TABLE dbo.PasswordResetTokens;
IF OBJECT_ID('dbo.Products', 'U') IS NOT NULL DROP TABLE dbo.Products;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NOT NULL DROP TABLE dbo.AuditLogs;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
GO

PRINT 'All tables dropped in SWP_Nhom3_App. Run SWP_Nhom3_App_full_schema.sql next.';
GO
