package com.auction.config;

import com.auction.account.util.PasswordUtil;
import com.auction.bidding.util.StepCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.StringJoiner;

@Component("sampleDataSeeder")
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        ensureCoreTables();
        ensureRole("Admin");
        ensureRole("Staff");
        ensureRole("Seller");
        ensureRole("User");
        ensureProductSchemaColumns();
        ensureCategorySchemaColumns();
        ensureUserPasswordHashColumn();
        ensureUserStrikeColumns();
        ensureWatchlistTable();
        ensureKycProfileTable();
        ensureCategoryAttributesTables();
        ensureEventTables();
        normalizeEventSeedData();
        seedDefaultCategories();
        seedCategoryAttributes();

        Long sellerRoleId = jdbcTemplate.queryForObject("SELECT TOP 1 RoleId FROM Roles WHERE RoleName = ?", Long.class, "Seller");
        Long userRoleId = jdbcTemplate.queryForObject("SELECT TOP 1 RoleId FROM Roles WHERE RoleName = ?", Long.class, "User");
        Long staffRoleId = jdbcTemplate.queryForObject("SELECT TOP 1 RoleId FROM Roles WHERE RoleName = ?", Long.class, "Staff");
        Long adminRoleId = jdbcTemplate.queryForObject("SELECT TOP 1 RoleId FROM Roles WHERE RoleName = ?", Long.class, "Admin");

        Long artId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Art");
        Long watchId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Luxury Watch");
        Long jewelryId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Jewelry");
        Long automotiveId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Automotive");
        Long furnitureId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Furniture");
        Long ceramicsId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Ceramics");

        LocalDateTime now = LocalDateTime.now();

        ensureUser("Seller One", "seller1", "seller1@example.com", "0900000101", "SELLER001", sellerRoleId, "password", now, false);
        ensureUser("Alice Bidder", "alice", "alice@example.com", "0900000102", "ALICE001", userRoleId, "password", now, false);
        ensureUser("Bob Bidder", "bob", "bob@example.com", "0900000103", "BOB001", userRoleId, "password", now, false);
        ensureUser("Wallet Test User", "walletuser", "user@example.com", "0900000201", "WALLETUSER001", userRoleId, "password", now, false);
        ensureUser("Wallet Staff", "walletstaff", "staff@example.com", "0900000202", "WALLETSTAFF001", staffRoleId, "password", now, true);
        ensureUser("System Admin", "admin", "admin@example.com", "0900000203", "ADMIN001", adminRoleId, "password", now, true);

        // Convenience demo accounts: role123@gmail.com / 123456 (all KYC-verified for testing).
        ensureUser("Demo User", "user123", "user123@gmail.com", "0911000001", "DEMOUSER123", userRoleId, "123456", now, true);
        ensureUser("Demo Seller", "seller123", "seller123@gmail.com", "0911000002", "DEMOSELLER123", sellerRoleId, "123456", now, true);
        ensureUser("Demo Staff", "staff123", "staff123@gmail.com", "0911000003", "DEMOSTAFF123", staffRoleId, "123456", now, true);
        ensureUser("Demo Admin", "admin123", "admin123@gmail.com", "0911000004", "DEMOADMIN123", adminRoleId, "123456", now, true);

        // Concurrent bidding test accounts: user1@gmail.com / user2@gmail.com / 123456
        ensureUser("Bid Test User 1", "user1", "user1@gmail.com", "0912000001", "USERTEST001", userRoleId, "123456", now, true);
        ensureUser("Bid Test User 2", "user2", "user2@gmail.com", "0912000002", "USERTEST002", userRoleId, "123456", now, true);

        // Seller account for posting products: seller1@gmail.com / 123456 (KYC + seller contract pre-seeded)
        ensureUser("Seller Test 1", "seller1gmail", "seller1@gmail.com", "0913000001", "SELLER1GMAIL01", sellerRoleId, "123456", now, true);

        Long sellerId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Username = ?", Long.class, "seller1");
        Long aliceId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Username = ?", Long.class, "alice");
        Long bobId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Username = ?", Long.class, "bob");
        Long walletUserId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Email = ?", Long.class, "user@example.com");

        ensureWallet(sellerId, 10000000L);
        ensureWallet(aliceId, 5000000L);
        ensureWallet(bobId, 8000000L);
        ensureWallet(walletUserId, 5000000L);

        Long demoUserId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Email = ?", Long.class, "user123@gmail.com");
        Long demoSellerId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Email = ?", Long.class, "seller123@gmail.com");
        ensureWallet(demoUserId, 10000000L);
        ensureWallet(demoSellerId, 10000000L);

        Long bidTestUser1Id = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Email = ?", Long.class, "user1@gmail.com");
        Long bidTestUser2Id = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Email = ?", Long.class, "user2@gmail.com");
        ensureWalletBalance(bidTestUser1Id, 50000000L);
        ensureWalletBalance(bidTestUser2Id, 50000000L);

        Long seller1GmailId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Email = ?", Long.class, "seller1@gmail.com");
        ensureWalletBalance(seller1GmailId, 10000000L);
        ensureSellerContract(seller1GmailId, now);
        ensureSellerContract(demoSellerId, now);

        insertProduct(sellerId, artId, "Vintage Painting", "A beautiful vintage painting.", 1000000L, "APPROVED", now);
        insertProduct(sellerId, watchId, "Rolex Classic", "Classic luxury watch.", 5000000L, "APPROVED", now);
        insertProduct(sellerId, artId, "Modern Abstract Canvas", "Colorful abstract artwork.", 1800000L, "APPROVED", now);
        insertProduct(sellerId, watchId, "Omega Seamaster", "Diving watch with stainless steel case.", 7200000L, "APPROVED", now);
        insertProduct(sellerId, artId, "Golden Frame Portrait", "Hand-painted portrait in a golden frame.", 2500000L, "APPROVED", now);
        insertProduct(sellerId, watchId, "Cartier Tank Must", "Elegant rectangular luxury watch.", 6100000L, "APPROVED", now);
        insertProduct(sellerId, artId, "Landscape Oil Painting", "Detailed landscape oil painting.", 1400000L, "APPROVED", now);
        insertProduct(sellerId, watchId, "Audemars Piguet Royal Oak", "Iconic luxury sports watch.", 21000000L, "APPROVED", now);
        insertProduct(sellerId, jewelryId, "Emerald Halo Ring", "18k gold ring with a vivid emerald center stone.", 3200000L, "APPROVED", now);
        insertProduct(sellerId, jewelryId, "Diamond Tennis Bracelet", "White gold bracelet with round brilliant diamonds.", 8800000L, "APPROVED", now);
        insertProduct(sellerId, automotiveId, "1967 Mustang Fastback", "Restored classic muscle car with matching numbers.", 45000000L, "APPROVED", now);
        insertProduct(sellerId, automotiveId, "Vespa Primavera 1978", "Collectible scooter in excellent running condition.", 2600000L, "APPROVED", now);
        insertProduct(sellerId, furnitureId, "Eames Lounge Chair", "Mid-century lounge chair and ottoman set.", 4200000L, "APPROVED", now);
        insertProduct(sellerId, furnitureId, "French Walnut Writing Desk", "Carved antique writing desk with brass pulls.", 3600000L, "APPROVED", now);
        insertProduct(sellerId, ceramicsId, "Ming Style Porcelain Vase", "Blue and white porcelain display vase.", 1900000L, "APPROVED", now);
        insertProduct(sellerId, ceramicsId, "Royal Doulton Flambe Bowl", "Collectible flambe glaze ceramic bowl.", 1300000L, "APPROVED", now);
        insertProduct(sellerId, artId, "Unsigned Watercolor Study", "Small study pending authenticity review.", 700000L, "PENDING", now);
        insertProduct(sellerId, watchId, "Prototype Digital Chronograph", "Modern watch submission awaiting staff review.", 2200000L, "PENDING", now);
        insertProduct(sellerId, jewelryId, "Damaged Pearl Necklace", "Rejected sample item with incomplete provenance.", 900000L, "REJECTED", now);
        insertProduct(sellerId, furnitureId, "Replica Barcelona Chair", "Rejected replica listing.", 1100000L, "REJECTED", now);

        syncProductStepPrices();

        removeDemoWonAuctionForContractTest();
        
        // Seed sample events
        Long adminId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE RoleId = (SELECT TOP 1 RoleId FROM Roles WHERE RoleName = 'Admin') ORDER BY UserId", Long.class);
        seedSampleEvents(now, adminId, sellerId, aliceId);
    }

    private void ensureCoreTables() {
        if (!hasTable("Roles")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Roles (" +
                            "RoleId INT IDENTITY(1,1) PRIMARY KEY, " +
                            "RoleName NVARCHAR(50) NOT NULL UNIQUE" +
                            ")"
            );
        }

        if (!hasTable("Users")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Users (" +
                            "UserId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "RoleId INT NULL, " +
                            "Username NVARCHAR(255) NULL, " +
                            "FullName NVARCHAR(150) NOT NULL, " +
                            "Email NVARCHAR(255) NOT NULL UNIQUE, " +
                            "Phone NVARCHAR(20) NOT NULL UNIQUE, " +
                            "IdentityNumber NVARCHAR(20) NULL, " +
                            "PasswordHash NVARCHAR(128) NOT NULL, " +
                            "Salt NVARCHAR(32) NOT NULL, " +
                            "PasswordIterations INT NOT NULL, " +
                            "EmailVerified BIT NOT NULL DEFAULT 0, " +
                            "EmailVerifiedAt DATETIME2 NULL, " +
                            "IdentityVerified BIT NOT NULL DEFAULT 0, " +
                            "IdentityVerifiedAt DATETIME2 NULL, " +
                            "VerificationLevel TINYINT NOT NULL DEFAULT 0, " +
                            "ProfileStatus NVARCHAR(30) NOT NULL DEFAULT 'PENDING_PROFILE', " +
                            "IsActive BIT NOT NULL DEFAULT 1, " +
                            "AuthProvider NVARCHAR(30) NOT NULL DEFAULT 'LOCAL', " +
                            "Status NVARCHAR(30) NOT NULL DEFAULT 'ACTIVE', " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)" +
                            ")"
            );
        }

        if (!hasTable("AuditLogs")) {
            jdbcTemplate.execute(
                    "CREATE TABLE AuditLogs (" +
                            "AuditLogID BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "Action NVARCHAR(30) NOT NULL, " +
                            "Success BIT NOT NULL, " +
                            "Subject NVARCHAR(255) NULL, " +
                            "Detail NVARCHAR(500) NULL, " +
                            "IpAddress NVARCHAR(64) NULL, " +
                            "UserAgent NVARCHAR(500) NULL, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()" +
                            ")"
            );
        }

        if (!hasTable("IdentityDocuments")) {
            jdbcTemplate.execute(
                    "CREATE TABLE IdentityDocuments (" +
                            "IdentityDocumentID BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "UserID BIGINT NOT NULL, " +
                            "DocumentType NVARCHAR(20) NOT NULL, " +
                            "DocumentNumber NVARCHAR(20) NOT NULL, " +
                            "FullName NVARCHAR(150) NOT NULL, " +
                            "DateOfBirth DATE NULL, " +
                            "FrontImagePath NVARCHAR(500) NULL, " +
                            "BackImagePath NVARCHAR(500) NULL, " +
                            "OcrProvider NVARCHAR(50) NULL, " +
                            "OcrResultJson NVARCHAR(MAX) NULL, " +
                            "Status NVARCHAR(30) NOT NULL, " +
                            "ReviewedBy NVARCHAR(100) NULL, " +
                            "ReviewedAt DATETIME2 NULL, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "UpdatedAt DATETIME2 NULL, " +
                            "CONSTRAINT FK_IdentityDocuments_Users FOREIGN KEY (UserID) REFERENCES Users(UserId)" +
                            ")"
            );
        }

        if (!hasTable("UserVerificationTokens")) {
            jdbcTemplate.execute(
                    "CREATE TABLE UserVerificationTokens (" +
                            "VerificationTokenID BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "UserID BIGINT NOT NULL, " +
                            "TokenHash NVARCHAR(128) NOT NULL, " +
                            "TokenType NVARCHAR(30) NOT NULL, " +
                            "ExpiresAt DATETIME2 NOT NULL, " +
                            "UsedAt DATETIME2 NULL, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_UserVerificationTokens_Users FOREIGN KEY (UserID) REFERENCES Users(UserId)" +
                            ")"
            );
        }

        if (!hasTable("PasswordResetTokens")) {
            jdbcTemplate.execute(
                    "CREATE TABLE PasswordResetTokens (" +
                            "PasswordResetTokenID BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "UserID BIGINT NOT NULL, " +
                            "TokenHash NVARCHAR(128) NOT NULL, " +
                            "ExpiresAt DATETIME2 NOT NULL, " +
                            "UsedAt DATETIME2 NULL, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserID) REFERENCES Users(UserId)" +
                            ")"
            );
        }

        if (!hasTable("Categories")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Categories (" +
                            "CategoryId INT IDENTITY(1,1) PRIMARY KEY, " +
                            "CategoryName NVARCHAR(100) NOT NULL UNIQUE, " +
                            "Description NVARCHAR(500) NULL, " +
                            "IsActive BIT NOT NULL DEFAULT 1, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()" +
                            ")"
            );
        }

        if (!hasTable("Products")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Products (" +
                            "ProductId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "SellerId BIGINT NOT NULL, " +
                            "CategoryId INT NOT NULL, " +
                            "ProductName NVARCHAR(255) NOT NULL, " +
                            "Description NVARCHAR(MAX) NULL, " +
                            "ImagesUrl NVARCHAR(MAX) NULL, " +
                            "[Condition] NVARCHAR(100) NULL, " +
                            "Brand NVARCHAR(150) NULL, " +
                            "Origin NVARCHAR(150) NULL, " +
                            "WeightSize NVARCHAR(150) NULL, " +
                            "StartingPrice BIGINT NOT NULL, " +
                            "StepPrice BIGINT NOT NULL DEFAULT 1000000, " +
                            "TaxPercent INT NOT NULL DEFAULT 5, " +
                            "Status NVARCHAR(30) NOT NULL DEFAULT 'PENDING', " +
                            "AuctionMode NVARCHAR(10) NULL, " +
                            "ScheduledStartTime DATETIME2 NULL, " +
                            "ScheduledDurationSeconds BIGINT NULL, " +
                            "SubmittedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "RejectionReason NVARCHAR(500) NULL, " +
                            "CONSTRAINT FK_Products_Users FOREIGN KEY (SellerId) REFERENCES Users(UserId), " +
                            "CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)" +
                            ")"
            );
        }

        if (!hasTable("ProductImages")) {
            jdbcTemplate.execute(
                    "CREATE TABLE ProductImages (" +
                            "ImageId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "ProductId BIGINT NOT NULL, " +
                            "ImageUrl NVARCHAR(500) NOT NULL, " +
                            "IsPrimary BIT NOT NULL DEFAULT 0, " +
                            "CONSTRAINT FK_ProductImages_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId)" +
                            ")"
            );
        }

        if (!hasTable("ProductApprovals")) {
            jdbcTemplate.execute(
                    "CREATE TABLE ProductApprovals (" +
                            "ApprovalId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "ProductId BIGINT NOT NULL, " +
                            "ReviewedBy BIGINT NOT NULL, " +
                            "Status NVARCHAR(30) NOT NULL, " +
                            "Reason NVARCHAR(500) NULL, " +
                            "ReviewedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_ProductApprovals_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId), " +
                            "CONSTRAINT FK_ProductApprovals_Users FOREIGN KEY (ReviewedBy) REFERENCES Users(UserId)" +
                            ")"
            );
        }

        if (!hasTable("Contracts")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Contracts (" +
                            "ContractId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "ContractType NVARCHAR(50) NOT NULL, " +
                            "ReferenceId BIGINT NOT NULL, " +
                            "FileUrl NVARCHAR(500) NOT NULL, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()" +
                            ")"
            );
        }

        if (!hasTable("Wallets")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Wallets (" +
                            "WalletId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "UserId BIGINT NOT NULL UNIQUE, " +
                            "Balance BIGINT NOT NULL DEFAULT 0, " +
                            "HoldBalance BIGINT NOT NULL DEFAULT 0, " +
                            "UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_Wallets_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)" +
                            ")"
            );
        }

        if (!hasTable("Transactions")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Transactions (" +
                            "TransactionId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "WalletId BIGINT NOT NULL, " +
                            "Amount BIGINT NOT NULL, " +
                            "TransactionType NVARCHAR(40) NOT NULL, " +
                            "Status NVARCHAR(30) NOT NULL, " +
                            "ReferenceCode NVARCHAR(120) NULL, " +
                            "Description NVARCHAR(500) NULL, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_Transactions_Wallets FOREIGN KEY (WalletId) REFERENCES Wallets(WalletId)" +
                            ")"
            );
        }

        if (!hasTable("WithdrawalRequests")) {
            jdbcTemplate.execute(
                    "CREATE TABLE WithdrawalRequests (" +
                            "WithdrawalRequestId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "UserId BIGINT NOT NULL, " +
                            "WalletId BIGINT NOT NULL, " +
                            "Amount BIGINT NOT NULL, " +
                            "BankName NVARCHAR(120) NOT NULL, " +
                            "AccountNumber NVARCHAR(60) NOT NULL, " +
                            "AccountName NVARCHAR(150) NOT NULL, " +
                            "Status NVARCHAR(30) NOT NULL, " +
                            "StaffNote NVARCHAR(500) NULL, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_WithdrawalRequests_Users FOREIGN KEY (UserId) REFERENCES Users(UserId), " +
                            "CONSTRAINT FK_WithdrawalRequests_Wallets FOREIGN KEY (WalletId) REFERENCES Wallets(WalletId)" +
                            ")"
            );
        }

        if (!hasTable("Auctions")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Auctions (" +
                            "AuctionId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "ProductId BIGINT NOT NULL UNIQUE, " +
                            "AuctionMode NVARCHAR(10) NOT NULL DEFAULT 'TIMED', " +
                            "ScheduledDurationSeconds BIGINT NULL, " +
                            "StartTime DATETIME2 NOT NULL, " +
                            "EndTime DATETIME2 NOT NULL, " +
                            "CurrentHighestBid BIGINT NOT NULL DEFAULT 0, " +
                            "CurrentWinnerUserId BIGINT NULL, " +
                            "Status NVARCHAR(30) NOT NULL, " +
                            "PaymentStatus NVARCHAR(20) NULL DEFAULT 'PENDING', " +
                            "PaymentDeadline DATETIME2 NULL, " +
                            "SettledAt DATETIME2 NULL, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_Auctions_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId), " +
                            "CONSTRAINT FK_Auctions_Winner FOREIGN KEY (CurrentWinnerUserId) REFERENCES Users(UserId)" +
                            ")"
            );
        }

        if (!hasTable("Auction_Deposits")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Auction_Deposits (" +
                            "DepositId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "AuctionId BIGINT NOT NULL, " +
                            "UserId BIGINT NOT NULL, " +
                            "DepositAmount BIGINT NOT NULL, " +
                            "Status NVARCHAR(30) NOT NULL, " +
                            "SettlementType NVARCHAR(20) NULL, " +
                            "SettledAt DATETIME2 NULL, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT UQ_AuctionDeposits_Auction_User UNIQUE (AuctionId, UserId), " +
                            "CONSTRAINT FK_AuctionDeposits_Auctions FOREIGN KEY (AuctionId) REFERENCES Auctions(AuctionId), " +
                            "CONSTRAINT FK_AuctionDeposits_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)" +
                            ")"
            );
        }

        if (!hasTable("Bids")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Bids (" +
                            "BidId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "AuctionId BIGINT NOT NULL, " +
                            "UserId BIGINT NOT NULL, " +
                            "BidAmount BIGINT NOT NULL, " +
                            "BidTime DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_Bids_Auctions FOREIGN KEY (AuctionId) REFERENCES Auctions(AuctionId), " +
                            "CONSTRAINT FK_Bids_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)" +
                            ")"
            );
        }

        if (!hasTable("Conversations")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Conversations (" +
                            "ConversationId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "UserId BIGINT NOT NULL, " +
                            "AssignedStaff BIGINT NULL, " +
                            "SellerId BIGINT NULL, " +
                            "ProductId BIGINT NULL, " +
                            "ConversationType NVARCHAR(30) NOT NULL, " +
                            "subject NVARCHAR(255) NOT NULL, " +
                            "status NVARCHAR(30) NOT NULL, " +
                            "createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "updatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_Conversations_User FOREIGN KEY (UserId) REFERENCES Users(UserId), " +
                            "CONSTRAINT FK_Conversations_AssignedStaff FOREIGN KEY (AssignedStaff) REFERENCES Users(UserId), " +
                            "CONSTRAINT FK_Conversations_Seller FOREIGN KEY (SellerId) REFERENCES Users(UserId), " +
                            "CONSTRAINT FK_Conversations_Product FOREIGN KEY (ProductId) REFERENCES Products(ProductId)" +
                            ")"
            );
        }

        if (!hasTable("Messages")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Messages (" +
                            "MessageId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "ConversationId BIGINT NOT NULL, " +
                            "SenderId BIGINT NOT NULL, " +
                            "content NVARCHAR(MAX) NOT NULL, " +
                            "isRead BIT NOT NULL DEFAULT 0, " +
                            "sentAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_Messages_Conversations FOREIGN KEY (ConversationId) REFERENCES Conversations(ConversationId), " +
                            "CONSTRAINT FK_Messages_Users FOREIGN KEY (SenderId) REFERENCES Users(UserId)" +
                            ")"
            );
        }

        if (!hasTable("Auction_Chat_Messages")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Auction_Chat_Messages (" +
                            "MessageId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "AuctionId BIGINT NOT NULL, " +
                            "SenderId BIGINT NOT NULL, " +
                            "Content NVARCHAR(1000) NOT NULL, " +
                            "SentAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_AuctionChat_Auction FOREIGN KEY (AuctionId) REFERENCES Auctions(AuctionId), " +
                            "CONSTRAINT FK_AuctionChat_User FOREIGN KEY (SenderId) REFERENCES Users(UserId)" +
                            ")"
            );
        }

        if (!hasTable("Notifications")) {
            jdbcTemplate.execute(
                    "CREATE TABLE Notifications (" +
                            "NotificationId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "UserId BIGINT NOT NULL, " +
                            "Title NVARCHAR(200) NOT NULL, " +
                            "Message NVARCHAR(1000) NOT NULL, " +
                            "Type NVARCHAR(50) NOT NULL, " +
                            "ReferenceId BIGINT NULL, " +
                            "ReferenceType NVARCHAR(50) NULL, " +
                            "IsRead BIT NOT NULL DEFAULT 0, " +
                            "CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(), " +
                            "CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)" +
                            ")"
            );
        }
    }

    private void ensureRole(String roleName) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Roles WHERE RoleName = ?", Integer.class, roleName);
        if (count != null && count > 0) return;
        jdbcTemplate.update("INSERT INTO Roles (RoleName) VALUES (?)", roleName);
    }

    private void seedDefaultCategories() {
        ensureCategory("Art", "Artwork and paintings");
        ensureCategory("Luxury Watch", "Premium watches");
        ensureCategory("Jewelry", "Fine jewelry and gemstones");
        ensureCategory("Automotive", "Classic and collectible vehicles");
        ensureCategory("Furniture", "Designer and antique furniture");
        ensureCategory("Ceramics", "Porcelain, pottery, and decorative ceramics");

        ensureCategory("Đồng hồ", "Đồng hồ cao cấp, đồng hồ sưu tầm và phụ kiện liên quan");
        ensureCategory("Đồ cổ", "Đồ cổ, vật phẩm sưu tầm và hiện vật có giá trị lịch sử");
        ensureCategory("Tranh nghệ thuật", "Tranh vẽ, tác phẩm mỹ thuật và tranh trang trí");
        ensureCategory("Trang sức", "Trang sức, đá quý và phụ kiện cao cấp");
        ensureCategory("Khác", "Các sản phẩm đấu giá chưa thuộc danh mục cụ thể");
    }

    private void ensureCategory(String categoryName, String description) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Categories WHERE CategoryName = ?", Integer.class, categoryName);
        if (count != null && count > 0) {
            jdbcTemplate.update("UPDATE Categories SET IsActive = COALESCE(IsActive, 1), CreatedAt = COALESCE(CreatedAt, SYSDATETIME()) WHERE CategoryName = ?", categoryName);
            return;
        }
        jdbcTemplate.update("INSERT INTO Categories (CategoryName, Description, IsActive, CreatedAt) VALUES (?, ?, ?, ?)", categoryName, description, true, LocalDateTime.now());
    }

    private void ensureProductSchemaColumns() {
        ensureColumn("Products", "[Condition]", "NVARCHAR(100) NULL");
        ensureColumn("Products", "Brand", "NVARCHAR(150) NULL");
        ensureColumn("Products", "Origin", "NVARCHAR(150) NULL");
        ensureColumn("Products", "WeightSize", "NVARCHAR(150) NULL");
        ensureColumn("Products", "SubmittedAt", "DATETIME2 NULL");
        ensureColumn("Products", "RejectionReason", "NVARCHAR(500) NULL");
        ensureColumn("Products", "ImagesUrl", "NVARCHAR(MAX) NULL");
        ensureColumn("Products", "AuctionMode", "NVARCHAR(10) NULL");
        ensureColumn("Products", "ScheduledStartTime", "DATETIME2 NULL");
        ensureColumn("Products", "ScheduledDurationSeconds", "BIGINT NULL");
        ensureColumn("Products", "TaxPercent", "INT NULL DEFAULT 5");
        ensureColumn("Products", "IsLockedInEvent", "BIT NOT NULL DEFAULT 0");
        ensureColumn("Auctions", "AuctionMode", "NVARCHAR(10) NOT NULL DEFAULT 'TIMED'");
        ensureColumn("Auctions", "ScheduledDurationSeconds", "BIGINT NULL");
        jdbcTemplate.update("UPDATE Products SET SubmittedAt = COALESCE(SubmittedAt, CreatedAt, SYSDATETIME())");
        jdbcTemplate.update("UPDATE Products SET TaxPercent = COALESCE(TaxPercent, 5) WHERE TaxPercent IS NULL");
    }

    private void ensureEventTables() {
        // AuctionEvents table
        if (!hasTable("AuctionEvents")) {
            jdbcTemplate.execute("""
                CREATE TABLE AuctionEvents (
                    EventId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    Name NVARCHAR(255) NOT NULL,
                    Slug NVARCHAR(255) NOT NULL UNIQUE,
                    Description NVARCHAR(MAX) NULL,
                    BannerUrl NVARCHAR(500) NULL,
                    EventCategory NVARCHAR(20) NOT NULL,
                    BiddingMode NVARCHAR(20) NOT NULL,
                    IsCharity BIT NOT NULL DEFAULT 0,
                    CharityPercent INT NULL,
                    RegistrationOpenAt DATETIME2 NULL,
                    RegistrationDeadline DATETIME2 NULL,
                    StartTime DATETIME2 NOT NULL,
                    EndTime DATETIME2 NOT NULL,
                    Status NVARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                    RulesText NVARCHAR(MAX) NULL,
                    RewardDescription NVARCHAR(MAX) NULL,
                    DutchConfigJson NVARCHAR(MAX) NULL,
                    SealedConfigJson NVARCHAR(MAX) NULL,
                    PennyConfigJson NVARCHAR(MAX) NULL,
                    AllowSellerSubmission BIT NOT NULL DEFAULT 1,
                    CreatedBy BIGINT NULL,
                    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
                    UpdatedAt DATETIME2 NULL,
                    Version BIGINT NOT NULL DEFAULT 0,
                    CONSTRAINT FK_AuctionEvents_Users_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(UserId)
                )
            """);
        }
        
        // EventProducts table
        if (!hasTable("EventProducts")) {
            jdbcTemplate.execute("""
                CREATE TABLE EventProducts (
                    EventProductId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    EventId BIGINT NOT NULL,
                    ProductId BIGINT NULL,
                    SourceType NVARCHAR(20) NOT NULL,
                    SubmittedBySellerId BIGINT NOT NULL,
                    ApprovalStatus NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
                    RejectReason NVARCHAR(500) NULL,
                    StartingPrice BIGINT NOT NULL,
                    CurrentPrice BIGINT NOT NULL,
                    PriceStep BIGINT NULL,
                    ReservePrice BIGINT NULL,
                    SessionStart DATETIME2 NULL,
                    SessionEnd DATETIME2 NULL,
                    SessionStatus NVARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
                    WinnerId BIGINT NULL,
                    FinalPrice BIGINT NULL,
                    Version BIGINT NOT NULL DEFAULT 0,
                    CONSTRAINT FK_EventProducts_AuctionEvents FOREIGN KEY (EventId) REFERENCES AuctionEvents(EventId),
                    CONSTRAINT FK_EventProducts_Products FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
                    CONSTRAINT FK_EventProducts_Users_SubmittedBySeller FOREIGN KEY (SubmittedBySellerId) REFERENCES Users(UserId),
                    CONSTRAINT FK_EventProducts_Users_Winner FOREIGN KEY (WinnerId) REFERENCES Users(UserId)
                )
            """);
            jdbcTemplate.execute("CREATE INDEX IX_EventProducts_EventId ON EventProducts(EventId)");
            jdbcTemplate.execute("CREATE INDEX IX_EventProducts_ProductId ON EventProducts(ProductId)");
        }
        
        // EventRegistrations table
        if (!hasTable("EventRegistrations")) {
            jdbcTemplate.execute("""
                CREATE TABLE EventRegistrations (
                    RegistrationId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    EventId BIGINT NOT NULL,
                    UserId BIGINT NOT NULL,
                    Role NVARCHAR(20) NOT NULL,
                    Status NVARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
                    RegisteredAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
                    NotifyOnOpen BIT NOT NULL DEFAULT 1,
                    CONSTRAINT FK_EventRegistrations_AuctionEvents FOREIGN KEY (EventId) REFERENCES AuctionEvents(EventId),
                    CONSTRAINT FK_EventRegistrations_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
                    CONSTRAINT UQ_EventRegistrations_Event_User UNIQUE (EventId, UserId)
                )
            """);
            jdbcTemplate.execute("CREATE INDEX IX_EventRegistrations_EventId ON EventRegistrations(EventId)");
            jdbcTemplate.execute("CREATE INDEX IX_EventRegistrations_UserId ON EventRegistrations(UserId)");
        }
        
        // SealedBids table
        if (!hasTable("SealedBids")) {
            jdbcTemplate.execute("""
                CREATE TABLE SealedBids (
                    SealedBidId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    EventProductId BIGINT NOT NULL,
                    UserId BIGINT NOT NULL,
                    BidAmount BIGINT NOT NULL,
                    SubmittedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
                    UpdatedAt DATETIME2 NULL,
                    Revealed BIT NOT NULL DEFAULT 0,
                    CONSTRAINT FK_SealedBids_EventProducts FOREIGN KEY (EventProductId) REFERENCES EventProducts(EventProductId),
                    CONSTRAINT FK_SealedBids_Users FOREIGN KEY (UserId) REFERENCES Users(UserId),
                    CONSTRAINT UQ_SealedBids_EventProduct_User UNIQUE (EventProductId, UserId)
                )
            """);
            jdbcTemplate.execute("CREATE INDEX IX_SealedBids_EventProductId ON SealedBids(EventProductId)");
            jdbcTemplate.execute("CREATE INDEX IX_SealedBids_UserId ON SealedBids(UserId)");
        }
        
        // PennyBids table
        if (!hasTable("PennyBids")) {
            jdbcTemplate.execute("""
                CREATE TABLE PennyBids (
                    PennyBidId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    EventProductId BIGINT NOT NULL,
                    UserId BIGINT NOT NULL,
                    PriceAfterBid BIGINT NOT NULL,
                    BidAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
                    CONSTRAINT FK_PennyBids_EventProducts FOREIGN KEY (EventProductId) REFERENCES EventProducts(EventProductId),
                    CONSTRAINT FK_PennyBids_Users FOREIGN KEY (UserId) REFERENCES Users(UserId)
                )
            """);
            jdbcTemplate.execute("CREATE INDEX IX_PennyBids_EventProductId ON PennyBids(EventProductId)");
            jdbcTemplate.execute("CREATE INDEX IX_PennyBids_UserId ON PennyBids(UserId)");
        }
    }

    private void normalizeEventSeedData() {
        if (!hasTable("AuctionEvents")) {
            return;
        }

        // Align existing seed/demo rows with the enum values used by JPA.
        jdbcTemplate.update("""
            UPDATE AuctionEvents
            SET EventCategory = CASE
                WHEN EventCategory IN ('ART', 'LUXURY_WATCH', 'AUTOMOTIVE', 'FURNITURE') THEN 'THEMED'
                WHEN EventCategory = 'JEWELRY' AND IsCharity = 1 THEN 'CHARITY'
                WHEN EventCategory = 'JEWELRY' THEN 'GENERAL'
                ELSE EventCategory
            END
            WHERE EventCategory NOT IN ('THEMED', 'CHARITY', 'GENERAL')
        """);

        jdbcTemplate.update("""
            UPDATE AuctionEvents
            SET Status = CASE
                WHEN Status = 'REGISTERING' THEN 'PUBLISHED'
                WHEN Status = 'RUNNING' THEN 'ONGOING'
                WHEN Status = 'FINISHED' THEN 'ENDED'
                WHEN Status = 'COMING_SOON' THEN 'PUBLISHED'
                ELSE Status
            END
            WHERE Status NOT IN ('DRAFT', 'PUBLISHED', 'ONGOING', 'ENDED', 'CANCELLED', 'ARCHIVED')
        """);
    }

    private void seedSampleEvents(LocalDateTime now, Long adminId, Long sellerId, Long userId) {
        // Sample Event 1: Standard Auction (DRAFT)
        insertSampleEvent(
            "Hội đấu giá nghệ thuật tháng 1",
            "hoi-dau-gia-nghe-thuat-thang-1",
            "Hội đấu giá các tác phẩm nghệ thuật đặc biệt",
            "https://example.com/banner1.jpg",
            "THEMED",
            "STANDARD",
            false,
            null,
            now.minusDays(7),
            now.plusDays(3),
            now.plusDays(5),
            now.plusDays(15),
            "DRAFT",
            adminId,
            now
        );
        
        // Sample Event 2: Standard Auction (PUBLISHED, coming soon)
        Long event2Id = insertSampleEvent(
            "Hội đấu giá đồng hồ cao cấp",
            "hoi-dau-gia-dong-ho-cao-cap",
            "Hội đấu giá các mẫu đồng hồ cao cấp từ các thương hiệu nổi tiếng",
            "https://example.com/banner2.jpg",
            "THEMED",
            "STANDARD",
            false,
            null,
            now.minusDays(2),
            now.plusDays(5),
            now.plusDays(7),
            now.plusDays(20),
            "PUBLISHED",
            adminId,
            now
        );
        
        // Sample Event 3: Dutch Auction (REGISTERING)
        Long event3Id = insertSampleEvent(
            "Hội đấu giá giảm giá nhanh",
            "hoi-dau-gia-giam-gia-nhanh",
            "Hội đấu giá theo định dạng Dutch, giá giảm mỗi phút",
            "https://example.com/banner3.jpg",
            "CHARITY",
            "DUTCH",
            true,
            10,
            now.minusDays(5),
            now.plusDays(2),
            now.plusDays(3),
            now.plusDays(10),
            "PUBLISHED",
            adminId,
            now
        );
        
        // Sample Event 4: Sealed Bid (ONGOING)
        Long event4Id = insertSampleEvent(
            "Hội đấu giá kín ô tô cổ",
            "hoi-dau-gia-kin-oto-co",
            "Hội đấu giá kín cho các xe cổ điển",
            "https://example.com/banner4.jpg",
            "THEMED",
            "SEALED_BID",
            false,
            null,
            now.minusDays(10),
            now.minusDays(1),
            now.minusDays(1),
            now.plusDays(7),
            "ONGOING",
            adminId,
            now
        );
        
        // Sample Event 5: Penny Auction (ENDED)
        insertSampleEvent(
            "Hội đấu giá xu thú vị",
            "hoi-dau-gia-xu-thu-vi",
            "Hội đấu giá Penny vui vẻ, mỗi lần đấu giá tăng 1000 đồng",
            "https://example.com/banner5.jpg",
            "GENERAL",
            "PENNY",
            false,
            null,
            now.minusDays(20),
            now.minusDays(15),
            now.minusDays(14),
            now.minusDays(7),
            "ENDED",
            adminId,
            now
        );
        
        // Add products to events
        if (event2Id != null && event3Id != null && event4Id != null) {
            // Get some existing product IDs
            List<Long> productIds = jdbcTemplate.queryForList(
                "SELECT TOP 5 ProductId FROM Products ORDER BY ProductId", Long.class
            );
            if (!productIds.isEmpty()) {
                // Add products to event 2
                for (int i = 0; i < Math.min(3, productIds.size()); i++) {
                    insertEventProduct(
                        event2Id,
                        productIds.get(i),
                        "EXISTING_PRODUCT",
                        sellerId,
                        "APPROVED",
                        1000000L + (i * 500000L),
                        now.plusDays(7).plusHours(i * 2),
                        now.plusDays(7).plusHours(i * 2 + 3)
                    );
                }
                
                // Add products to event3
                for (int i = 0; i < Math.min(2, productIds.size()); i++) {
                    insertEventProduct(
                        event3Id,
                        productIds.get(i),
                        "EXISTING_PRODUCT",
                        sellerId,
                        "APPROVED",
                        5000000L + (i * 1000000L),
                        now.plusDays(3).plusHours(i * 3),
                        now.plusDays(3).plusHours(i * 3 + 2)
                    );
                }
                
                // Add products to event4
                for (int i = 0; i < Math.min(2, productIds.size()); i++) {
                    insertEventProduct(
                        event4Id,
                        productIds.get(i),
                        "EXISTING_PRODUCT",
                        sellerId,
                        "APPROVED",
                        20000000L + (i * 5000000L),
                        now.minusDays(1).plusHours(i * 2),
                        now.plusDays(7).plusHours(i * 2)
                    );
                }
            }
            
            // Add registrations
            insertEventRegistration(event2Id, userId, "BIDDER", "REGISTERED", now);
            insertEventRegistration(event2Id, sellerId, "SELLER", "REGISTERED", now);
            insertEventRegistration(event3Id, userId, "BIDDER", "REGISTERED", now);
            insertEventRegistration(event4Id, userId, "BIDDER", "REGISTERED", now);
        }
    }

    private Long insertSampleEvent(String name, String slug, String description, String bannerUrl, 
                                   String category, String biddingMode, boolean isCharity, 
                                   Integer charityPercent, LocalDateTime regOpen, LocalDateTime regDeadline,
                                   LocalDateTime startTime, LocalDateTime endTime, String status,
                                   Long createdBy, LocalDateTime now) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM AuctionEvents WHERE Slug = ?", Integer.class, slug
        );
        if (count != null && count > 0) {
            return jdbcTemplate.queryForObject(
                "SELECT TOP 1 EventId FROM AuctionEvents WHERE Slug = ?", Long.class, slug
            );
        }
        
        jdbcTemplate.update("""
            INSERT INTO AuctionEvents (
                Name, Slug, Description, BannerUrl, EventCategory, BiddingMode, IsCharity, CharityPercent,
                RegistrationOpenAt, RegistrationDeadline, StartTime, EndTime, Status, RulesText,
                RewardDescription, AllowSellerSubmission, CreatedBy, CreatedAt, Version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, name, slug, description, bannerUrl, category, biddingMode, isCharity, charityPercent,
           regOpen, regDeadline, startTime, endTime, status, 
           "Quy tắc tham gia: Đăng ký trước thời hạn, có đủ số dư ví.",
           "Phần thưởng: Giảm giá 5% cho người thắng cuộc.",
           true, createdBy, now, 0L);
        
        return jdbcTemplate.queryForObject("SELECT TOP 1 EventId FROM AuctionEvents WHERE Slug = ?", Long.class, slug);
    }

    private void insertEventProduct(Long eventId, Long productId, String sourceType, 
                                    Long sellerId, String approvalStatus, Long startingPrice,
                                    LocalDateTime sessionStart, LocalDateTime sessionEnd) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM EventProducts WHERE EventId = ? AND ProductId = ?", 
            Integer.class, eventId, productId
        );
        if (count != null && count > 0) return;
        
        jdbcTemplate.update("""
            INSERT INTO EventProducts (
                EventId, ProductId, SourceType, SubmittedBySellerId, ApprovalStatus, 
                StartingPrice, CurrentPrice, PriceStep, SessionStart, SessionEnd, SessionStatus, Version
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, eventId, productId, sourceType, sellerId, approvalStatus,
           startingPrice, startingPrice, StepCalculator.calculate(startingPrice),
           sessionStart, sessionEnd, "SCHEDULED", 0L);
    }

    private void insertEventRegistration(Long eventId, Long userId, String role, 
                                         String status, LocalDateTime now) {
        Integer count = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM EventRegistrations WHERE EventId = ? AND UserId = ?",
            Integer.class, eventId, userId
        );
        if (count != null && count > 0) return;
        
        jdbcTemplate.update("""
            INSERT INTO EventRegistrations (EventId, UserId, Role, Status, RegisteredAt, NotifyOnOpen)
            VALUES (?, ?, ?, ?, ?, ?)
        """, eventId, userId, role, status, now, true);
    }

    private void ensureCategorySchemaColumns() {
        ensureColumn("Categories", "IsActive", "BIT NULL");
        ensureColumn("Categories", "CreatedAt", "DATETIME2 NULL");
        jdbcTemplate.update("UPDATE Categories SET IsActive = COALESCE(IsActive, 1), CreatedAt = COALESCE(CreatedAt, SYSDATETIME())");
    }

    private void ensureColumn(String tableName, String columnName, String definition) {
        String bareColumnName = columnName.replace("[", "").replace("]", "");
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                tableName,
                bareColumnName
        );
        if (count != null && count > 0) return;

        jdbcTemplate.execute("ALTER TABLE " + tableName + " ADD " + columnName + " " + definition);
    }

    private void ensureWatchlistTable() {
        Integer tableCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Watchlist'",
                Integer.class
        );
        if (tableCount != null && tableCount > 0) return;

        jdbcTemplate.execute(
                "CREATE TABLE Watchlist (" +
                "watchlist_id INT IDENTITY(1,1) PRIMARY KEY, " +
                "user_id BIGINT NOT NULL, " +
                "product_id BIGINT NOT NULL, " +
                "created_at DATETIME2 NULL, " +
                "FOREIGN KEY (user_id) REFERENCES Users(UserId), " +
                "FOREIGN KEY (product_id) REFERENCES Products(ProductId)" +
                ")"
        );
    }

    private void ensureKycProfileTable() {
        // Idempotent schema bootstrap: the KYC flow was added after the initial
        // release and a fresh install won't have the table yet, so we create it
        // here the first time the seeder runs. The column set mirrors
        // com.auction.account.entity.KycProfile so JPA reads and JDBC writes
        // both target the same physical schema.
        if (!hasTable("KycProfiles")) {
            jdbcTemplate.execute(
                    "CREATE TABLE KycProfiles (" +
                            "KycId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "UserId BIGINT NOT NULL UNIQUE, " +
                            "Phone NVARCHAR(30) NOT NULL, " +
                            "CccdNumber NVARCHAR(20) NOT NULL, " +
                            "FullName NVARCHAR(255) NOT NULL, " +
                            "Dob DATE NOT NULL, " +
                            "Gender NVARCHAR(20) NOT NULL, " +
                            "IssueDate DATE NOT NULL, " +
                            "IssuePlace NVARCHAR(255) NOT NULL, " +
                            "FrontImageUrl NVARCHAR(500) NOT NULL, " +
                            "BackImageUrl NVARCHAR(500) NOT NULL, " +
                            "SelfieImageUrl NVARCHAR(500) NOT NULL, " +
                            "Status NVARCHAR(20) NOT NULL, " +
                            "SubmittedAt DATETIME2 NOT NULL, " +
                            "ProcessedBy BIGINT NULL, " +
                            "ProcessedAt DATETIME2 NULL, " +
                            "RejectionReason NVARCHAR(500) NULL, " +
                            "FOREIGN KEY (UserId) REFERENCES Users(UserId), " +
                            "FOREIGN KEY (ProcessedBy) REFERENCES Users(UserId)" +
                            ")"
            );
            return;
        }
        // Pre-existing table from an earlier install may be missing the
        // RejectionReason column that the staff review flow writes to. Add it
        // on the fly so the JDBC queries don't fail with "Invalid column name".
        if (!hasColumn("KycProfiles", "RejectionReason")) {
            jdbcTemplate.execute("ALTER TABLE KycProfiles ADD RejectionReason NVARCHAR(500) NULL");
        }
        dropKycCccdUniqueConstraintIfPresent();
    }

    /** Allow multiple KYC rows with the same CCCD; staff review flags duplicates. */
    private void dropKycCccdUniqueConstraintIfPresent() {
        if (!hasTable("KycProfiles")) {
            return;
        }
        try {
            List<String> names = jdbcTemplate.queryForList(
                    "SELECT kc.name FROM sys.key_constraints kc "
                            + "INNER JOIN sys.index_columns ic ON ic.object_id = kc.parent_object_id "
                            + "AND ic.index_id = kc.unique_index_id "
                            + "INNER JOIN sys.columns c ON c.object_id = ic.object_id AND c.column_id = ic.column_id "
                            + "WHERE kc.parent_object_id = OBJECT_ID('KycProfiles') AND kc.type = 'UQ' "
                            + "AND c.name = 'CccdNumber'",
                    String.class);
            for (String name : names) {
                jdbcTemplate.execute("ALTER TABLE KycProfiles DROP CONSTRAINT [" + name.replace("]", "]]") + "]");
            }
        } catch (Exception ex) {
            // Best-effort for environments without sys catalog access
        }
    }

    private void ensureCategoryAttributesTables() {
        if (!hasTable("CategoryAttributes")) {
            jdbcTemplate.execute(
                    "CREATE TABLE CategoryAttributes (" +
                            "AttributeId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "CategoryId INT NOT NULL, " +
                            "AttributeName NVARCHAR(100) NOT NULL, " +
                            "DataType NVARCHAR(50) NOT NULL, " +
                            "IsRequired BIT NOT NULL DEFAULT 0, " +
                            "DisplayOrder INT NOT NULL DEFAULT 0, " +
                            "FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)" +
                            ")"
            );
        }
        if (!hasTable("ProductAttributeValues")) {
            jdbcTemplate.execute(
                    "CREATE TABLE ProductAttributeValues (" +
                            "ValueId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "ProductId BIGINT NOT NULL, " +
                            "AttributeId BIGINT NOT NULL, " +
                            "AttributeValue NVARCHAR(500) NOT NULL, " +
                            "FOREIGN KEY (ProductId) REFERENCES Products(ProductId), " +
                            "FOREIGN KEY (AttributeId) REFERENCES CategoryAttributes(AttributeId)" +
                            ")"
            );
        }
        if (!hasTable("attribute_options")) {
            jdbcTemplate.execute(
                    "CREATE TABLE attribute_options (" +
                            "OptionId BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                            "AttributeId BIGINT NOT NULL, " +
                            "OptionValue NVARCHAR(100) NOT NULL, " +
                            "FOREIGN KEY (AttributeId) REFERENCES CategoryAttributes(AttributeId)" +
                            ")"
            );
        }
    }

    private void seedCategoryAttributes() {
        Object[][] seeds = new Object[][] {
                { "Art", "Artist", "TEXT", true, 1 },
                { "Art", "Year", "NUMBER", true, 2 },
                { "Art", "Medium", "TEXT", true, 3 },
                { "Art", "Dimensions (cm)", "TEXT", false, 4 },
                { "Art", "Style", "TEXT", false, 5 },

                { "Luxury Watch", "Brand", "TEXT", true, 1 },
                { "Luxury Watch", "Model", "TEXT", true, 2 },
                { "Luxury Watch", "Reference Number", "TEXT", true, 3 },
                { "Luxury Watch", "Year", "NUMBER", true, 4 },
                { "Luxury Watch", "Movement", "TEXT", true, 5 },
                { "Luxury Watch", "Case Material", "TEXT", true, 6 },
                { "Luxury Watch", "Box & Papers", "TEXT", false, 7 },

                { "Jewelry", "Material", "TEXT", true, 1 },
                { "Jewelry", "Gemstone", "TEXT", false, 2 },
                { "Jewelry", "Carat Weight", "NUMBER", false, 3 },
                { "Jewelry", "Ring Size", "TEXT", false, 4 },

                { "Automotive", "Make", "TEXT", true, 1 },
                { "Automotive", "Model", "TEXT", true, 2 },
                { "Automotive", "Year", "NUMBER", true, 3 },
                { "Automotive", "Mileage (km)", "NUMBER", true, 4 },
                { "Automotive", "VIN", "TEXT", false, 5 },
                { "Automotive", "Transmission", "TEXT", true, 6 },

                { "Furniture", "Designer", "TEXT", false, 1 },
                { "Furniture", "Year", "NUMBER", false, 2 },
                { "Furniture", "Material", "TEXT", true, 3 },
                { "Furniture", "Dimensions (cm)", "TEXT", false, 4 },
                { "Furniture", "Condition", "TEXT", true, 5 },

                { "Ceramics", "Origin", "TEXT", true, 1 },
                { "Ceramics", "Period", "TEXT", false, 2 },
                { "Ceramics", "Material", "TEXT", true, 3 },
                { "Ceramics", "Height (cm)", "NUMBER", false, 4 },

                { "Đồng hồ", "Thương hiệu", "TEXT", true, 1 },
                { "Đồng hồ", "Mẫu / dòng", "TEXT", true, 2 },
                { "Đồng hồ", "Năm sản xuất", "NUMBER", false, 3 },
                { "Đồng hồ", "Chất liệu vỏ", "TEXT", false, 4 },

                { "Đồ cổ", "Niên đại", "TEXT", true, 1 },
                { "Đồ cổ", "Xuất xứ", "TEXT", true, 2 },
                { "Đồ cổ", "Chất liệu", "TEXT", false, 3 },
                { "Đồ cổ", "Tình trạng", "TEXT", true, 4 },

                { "Tranh nghệ thuật", "Tác giả", "TEXT", false, 1 },
                { "Tranh nghệ thuật", "Năm sáng tác", "NUMBER", false, 2 },
                { "Tranh nghệ thuật", "Chất liệu", "TEXT", true, 3 },
                { "Tranh nghệ thuật", "Kích thước", "TEXT", false, 4 },

                { "Trang sức", "Chất liệu", "TEXT", true, 1 },
                { "Trang sức", "Đá quý", "TEXT", false, 2 },
                { "Trang sức", "Trọng lượng", "TEXT", false, 3 },

                { "Khác", "Tình trạng", "TEXT", false, 1 },
                { "Khác", "Ghi chú thêm", "TEXT", false, 2 }
        };

        for (Object[] row : seeds) {
            String categoryName = (String) row[0];
            String attributeName = (String) row[1];
            String dataType = (String) row[2];
            boolean isRequired = (boolean) row[3];
            int displayOrder = (int) row[4];

            Integer categoryId = jdbcTemplate.query(
                    "SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?",
                    (rs, rowNum) -> rs.getInt("CategoryId"),
                    categoryName
            ).stream().findFirst().orElse(null);
            if (categoryId == null) continue;

            ensureCategoryAttribute(categoryId, attributeName, dataType, isRequired, displayOrder);
        }
    }

    private void ensureCategoryAttribute(Integer categoryId, String attributeName, String dataType, boolean isRequired, int displayOrder) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM CategoryAttributes WHERE CategoryId = ? AND AttributeName = ?",
                Integer.class,
                categoryId,
                attributeName
        );
        if (count != null && count > 0) {
            jdbcTemplate.update(
                    "UPDATE CategoryAttributes SET DataType = ?, IsRequired = ?, DisplayOrder = ? WHERE CategoryId = ? AND AttributeName = ?",
                    dataType, isRequired, displayOrder, categoryId, attributeName
            );
            return;
        }

        jdbcTemplate.update(
                "INSERT INTO CategoryAttributes (CategoryId, AttributeName, DataType, IsRequired, DisplayOrder) VALUES (?, ?, ?, ?, ?)",
                categoryId, attributeName, dataType, isRequired, displayOrder
        );
    }

    private boolean hasTable(String tableName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?",
                Integer.class, tableName
        );
        return count != null && count > 0;
    }

    private void ensureUserStrikeColumns() {
        ensureColumn("Users", "PaymentStrikeCount", "INT NOT NULL DEFAULT 0");
        ensureColumn("Users", "LockedByPaymentStrikes", "BIT NOT NULL DEFAULT 0");
    }

    private void ensureUserPasswordHashColumn() {
        if (!hasColumn("Users", "PasswordHash") || !isBinaryColumn("Users", "PasswordHash")) {
            return;
        }

        if (!hasColumn("Users", "PasswordHashText")) {
            jdbcTemplate.execute("ALTER TABLE Users ADD PasswordHashText NVARCHAR(128) NULL");
        }
        jdbcTemplate.execute("UPDATE Users SET PasswordHashText = CONVERT(VARCHAR(128), PasswordHash, 2)");
        jdbcTemplate.execute("ALTER TABLE Users DROP COLUMN PasswordHash");
        jdbcTemplate.execute("EXEC sp_rename 'Users.PasswordHashText', 'PasswordHash', 'COLUMN'");
    }

    private void ensureUser(String fullName, String username, String email, String phone, String identityNumber,
                            Long roleId, String password, LocalDateTime now, boolean identityVerified) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Users WHERE Email = ?", Integer.class, email);
        String salt = PasswordUtil.generateSalt();
        int iterations = PasswordUtil.getIterations();
        String passwordHash = PasswordUtil.hashPassword(password, salt, iterations);

        // Staff/admin are pre-verified so they can sign in and moderate.
        // Regular users must complete the KYC submission flow before they
        // can be marked as identity verified.
        String profileStatus = identityVerified ? "VERIFIED" : "PENDING_IDENTITY_VERIFY";
        int verificationLevel = identityVerified ? 2 : 1;

        if (count != null && count > 0) {
            jdbcTemplate.update(
                    "UPDATE Users SET " + passwordHashAssignment() + ", Salt = ?, PasswordIterations = ?, IsActive = 1, ProfileStatus = ?, VerificationLevel = ?, RoleId = ? WHERE Email = ?",
                    passwordHash, salt, iterations, profileStatus, verificationLevel, roleId, email
            );
            if (hasColumn("Users", "Username")) {
                jdbcTemplate.update("UPDATE Users SET Username = ? WHERE Email = ?", username, email);
            }
            if (hasColumn("Users", "Status")) {
                jdbcTemplate.update("UPDATE Users SET Status = ? WHERE Email = ?", "ACTIVE", email);
            }
            // Re-sync the identity-verified flag every time the seeder runs.
            if (hasColumn("Users", "IdentityVerified")) {
                jdbcTemplate.update("UPDATE Users SET IdentityVerified = ?, IdentityVerifiedAt = ? WHERE Email = ?",
                        identityVerified, identityVerified ? now : null, email);
            }
            if (hasColumn("Users", "EmailVerified")) {
                jdbcTemplate.update("UPDATE Users SET EmailVerified = ?, EmailVerifiedAt = ? WHERE Email = ?",
                        true, now, email);
            }
            return;
        }

        List<String> columns = new ArrayList<>();
        List<Object> values = new ArrayList<>();

        addColumnValue(columns, values, "RoleId", roleId);
        addColumnValue(columns, values, "Username", username);
        addColumnValue(columns, values, "FullName", fullName);
        addColumnValue(columns, values, "Email", email);
        addColumnValue(columns, values, "Phone", phone);
        addColumnValue(columns, values, "IdentityNumber", identityNumber);
        addColumnValue(columns, values, "PasswordHash", passwordHash);
        addColumnValue(columns, values, "Salt", salt);
        addColumnValue(columns, values, "PasswordIterations", iterations);
        addColumnValue(columns, values, "EmailVerified", true);
        addColumnValue(columns, values, "EmailVerifiedAt", now);
        addColumnValue(columns, values, "IdentityVerified", identityVerified);
        addColumnValue(columns, values, "IdentityVerifiedAt", identityVerified ? now : null);
        addColumnValue(columns, values, "VerificationLevel", verificationLevel);
        addColumnValue(columns, values, "ProfileStatus", profileStatus);
        addColumnValue(columns, values, "IsActive", true);
        addColumnValue(columns, values, "AuthProvider", "LOCAL");
        addColumnValue(columns, values, "Status", "ACTIVE");
        addColumnValue(columns, values, "CreatedAt", now);

        StringJoiner placeholders = new StringJoiner(", ");
        for (String column : columns) {
            if ("PasswordHash".equalsIgnoreCase(column) && isBinaryColumn("Users", "PasswordHash")) {
                placeholders.add("CONVERT(VARBINARY(128), ?, 2)");
            } else {
                placeholders.add("?");
            }
        }

        jdbcTemplate.update(
                "INSERT INTO Users (" + String.join(", ", columns) + ") VALUES (" + placeholders + ")",
                values.toArray()
        );
    }

    private void addColumnValue(List<String> columns, List<Object> values, String columnName, Object value) {
        if (!hasColumn("Users", columnName)) {
            return;
        }
        columns.add(columnName);
        values.add(value);
    }

    private String passwordHashAssignment() {
        if (isBinaryColumn("Users", "PasswordHash")) {
            return "PasswordHash = CONVERT(VARBINARY(128), ?, 2)";
        }
        return "PasswordHash = ?";
    }

    private boolean isBinaryColumn(String tableName, String columnName) {
        String dataType = jdbcTemplate.queryForObject(
                "SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?",
                String.class,
                tableName,
                columnName
        );
        return dataType != null && dataType.toLowerCase().contains("binary");
    }

    private boolean hasColumn(String tableName, String columnName) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                tableName,
                columnName
        );
        return count != null && count > 0;
    }

    private void insertProduct(Long sellerId, Long categoryId, String name, String description,
                               Long startingPrice, String status, LocalDateTime now) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Products WHERE ProductName = ?", Integer.class, name);
        if (count != null && count > 0) return;
        long stepPrice = StepCalculator.calculate(startingPrice);
        jdbcTemplate.update(
                "INSERT INTO Products (SellerId, CategoryId, ProductName, Description, ImagesUrl, [Condition], Brand, Origin, WeightSize, StartingPrice, StepPrice, Status, SubmittedAt, CreatedAt, TaxPercent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                sellerId, categoryId, name, description, "[]", "GOOD", "BrandX", "Vietnam", "Standard",
                startingPrice, stepPrice, status, now, now, 5
        );
    }

    /** Align legacy/seed StepPrice with StepCalculator tiers. */
    private void syncProductStepPrices() {
        jdbcTemplate.query(
                "SELECT ProductId, StartingPrice FROM Products",
                (rs, rowNum) -> {
                    long productId = rs.getLong("ProductId");
                    long startingPrice = rs.getLong("StartingPrice");
                    long correctStep = StepCalculator.calculate(startingPrice);
                    jdbcTemplate.update(
                            "UPDATE Products SET StepPrice = ? WHERE ProductId = ? AND StepPrice <> ?",
                            correctStep, productId, correctStep
                    );
                    return null;
                }
        );
    }

    private void ensureWallet(Long userId, Long balance) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Wallets WHERE UserId = ?", Integer.class, userId);
        if (count != null && count > 0) return;
        jdbcTemplate.update(
                "INSERT INTO Wallets (UserId, Balance, HoldBalance, UpdatedAt) VALUES (?, ?, ?, ?)",
                userId, balance, 0L, LocalDateTime.now()
        );
    }

    /** Creates or refreshes wallet balance for demo/test accounts on each startup. */
    private void ensureWalletBalance(Long userId, Long balance) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Wallets WHERE UserId = ?", Integer.class, userId);
        if (count != null && count > 0) {
            jdbcTemplate.update(
                    "UPDATE Wallets SET Balance = ?, HoldBalance = 0, UpdatedAt = ? WHERE UserId = ?",
                    balance, LocalDateTime.now(), userId
            );
            return;
        }
        jdbcTemplate.update(
                "INSERT INTO Wallets (UserId, Balance, HoldBalance, UpdatedAt) VALUES (?, ?, ?, ?)",
                userId, balance, 0L, LocalDateTime.now()
        );
    }

    private void ensureSellerContract(Long userId, LocalDateTime now) {
        if (!hasTable("Contracts")) {
            return;
        }
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM Contracts WHERE ContractType = ? AND ReferenceId = ?",
                Integer.class, "SELLER_AGREEMENT", userId);
        if (count != null && count > 0) {
            return;
        }
        jdbcTemplate.update(
                "INSERT INTO Contracts (ContractType, ReferenceId, FileUrl, CreatedAt) VALUES (?, ?, ?, ?)",
                "SELLER_AGREEMENT",
                userId,
                "/uploads/contracts/seller-" + userId + "-seed.pdf",
                now
        );
    }

    /** Removes the contract-test demo lot if it was seeded earlier. */
    private void removeDemoWonAuctionForContractTest() {
        final String productName = "Demo Contract Test Lot";
        Long productId = jdbcTemplate.query(
                "SELECT TOP 1 ProductId FROM Products WHERE ProductName = ?",
                rs -> rs.next() ? rs.getLong(1) : null,
                productName);
        if (productId == null) {
            return;
        }
        Long auctionId = jdbcTemplate.query(
                "SELECT TOP 1 AuctionId FROM Auctions WHERE ProductId = ?",
                rs -> rs.next() ? rs.getLong(1) : null,
                productId);
        if (auctionId != null) {
            jdbcTemplate.update(
                    "DELETE FROM Contracts WHERE ContractType = 'PURCHASE_AGREEMENT' AND ReferenceId = ?",
                    auctionId);
            jdbcTemplate.update("DELETE FROM Bids WHERE AuctionId = ?", auctionId);
            jdbcTemplate.update("DELETE FROM Auction_Deposits WHERE AuctionId = ?", auctionId);
            jdbcTemplate.update("DELETE FROM Auctions WHERE AuctionId = ?", auctionId);
        }
        jdbcTemplate.update("DELETE FROM Products WHERE ProductId = ?", productId);
    }
}
