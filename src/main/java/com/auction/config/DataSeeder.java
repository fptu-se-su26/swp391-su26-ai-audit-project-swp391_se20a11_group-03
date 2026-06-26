package com.auction.config;

import com.auction.account.util.PasswordUtil;
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
        ensureWatchlistTable();
        ensureKycProfileTable();
        ensureCategoryAttributesTables();
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

        insertProduct(sellerId, artId, "Vintage Painting", "A beautiful vintage painting.", 1000000L, 100000L, "APPROVED", now);
        insertProduct(sellerId, watchId, "Rolex Classic", "Classic luxury watch.", 5000000L, 200000L, "APPROVED", now);
        insertProduct(sellerId, artId, "Modern Abstract Canvas", "Colorful abstract artwork.", 1800000L, 100000L, "APPROVED", now);
        insertProduct(sellerId, watchId, "Omega Seamaster", "Diving watch with stainless steel case.", 7200000L, 200000L, "APPROVED", now);
        insertProduct(sellerId, artId, "Golden Frame Portrait", "Hand-painted portrait in a golden frame.", 2500000L, 150000L, "APPROVED", now);
        insertProduct(sellerId, watchId, "Cartier Tank Must", "Elegant rectangular luxury watch.", 6100000L, 200000L, "APPROVED", now);
        insertProduct(sellerId, artId, "Landscape Oil Painting", "Detailed landscape oil painting.", 1400000L, 100000L, "APPROVED", now);
        insertProduct(sellerId, watchId, "Audemars Piguet Royal Oak", "Iconic luxury sports watch.", 21000000L, 500000L, "APPROVED", now);
        insertProduct(sellerId, jewelryId, "Emerald Halo Ring", "18k gold ring with a vivid emerald center stone.", 3200000L, 150000L, "APPROVED", now);
        insertProduct(sellerId, jewelryId, "Diamond Tennis Bracelet", "White gold bracelet with round brilliant diamonds.", 8800000L, 250000L, "APPROVED", now);
        insertProduct(sellerId, automotiveId, "1967 Mustang Fastback", "Restored classic muscle car with matching numbers.", 45000000L, 1000000L, "APPROVED", now);
        insertProduct(sellerId, automotiveId, "Vespa Primavera 1978", "Collectible scooter in excellent running condition.", 2600000L, 100000L, "APPROVED", now);
        insertProduct(sellerId, furnitureId, "Eames Lounge Chair", "Mid-century lounge chair and ottoman set.", 4200000L, 150000L, "APPROVED", now);
        insertProduct(sellerId, furnitureId, "French Walnut Writing Desk", "Carved antique writing desk with brass pulls.", 3600000L, 150000L, "APPROVED", now);
        insertProduct(sellerId, ceramicsId, "Ming Style Porcelain Vase", "Blue and white porcelain display vase.", 1900000L, 100000L, "APPROVED", now);
        insertProduct(sellerId, ceramicsId, "Royal Doulton Flambe Bowl", "Collectible flambe glaze ceramic bowl.", 1300000L, 100000L, "APPROVED", now);
        insertProduct(sellerId, artId, "Unsigned Watercolor Study", "Small study pending authenticity review.", 700000L, 50000L, "PENDING", now);
        insertProduct(sellerId, watchId, "Prototype Digital Chronograph", "Modern watch submission awaiting staff review.", 2200000L, 100000L, "PENDING", now);
        insertProduct(sellerId, jewelryId, "Damaged Pearl Necklace", "Rejected sample item with incomplete provenance.", 900000L, 50000L, "REJECTED", now);
        insertProduct(sellerId, furnitureId, "Replica Barcelona Chair", "Rejected replica listing.", 1100000L, 50000L, "REJECTED", now);

        Long productId = jdbcTemplate.queryForObject("SELECT TOP 1 ProductId FROM Products WHERE ProductName = ?", Long.class, "Vintage Painting");
        Long productId2 = jdbcTemplate.queryForObject("SELECT TOP 1 ProductId FROM Products WHERE ProductName = ?", Long.class, "Rolex Classic");
        Long productId3 = jdbcTemplate.queryForObject("SELECT TOP 1 ProductId FROM Products WHERE ProductName = ?", Long.class, "Modern Abstract Canvas");
        Long productId4 = jdbcTemplate.queryForObject("SELECT TOP 1 ProductId FROM Products WHERE ProductName = ?", Long.class, "Omega Seamaster");
        Long productId5 = jdbcTemplate.queryForObject("SELECT TOP 1 ProductId FROM Products WHERE ProductName = ?", Long.class, "Golden Frame Portrait");
        Long productId6 = jdbcTemplate.queryForObject("SELECT TOP 1 ProductId FROM Products WHERE ProductName = ?", Long.class, "Cartier Tank Must");
        Long productId7 = jdbcTemplate.queryForObject("SELECT TOP 1 ProductId FROM Products WHERE ProductName = ?", Long.class, "Landscape Oil Painting");
        Long productId8 = jdbcTemplate.queryForObject("SELECT TOP 1 ProductId FROM Products WHERE ProductName = ?", Long.class, "Audemars Piguet Royal Oak");

        // Seed auctions starting 1-8 days out so the 30-minute deposit window
        // stays open long after seeding (lets users test deposit/bidding).
        seedAuction(productId, bobId, now.plusDays(1), now.plusDays(2), 0L, "UPCOMING");
        seedAuction(productId2, aliceId, now.plusDays(2), now.plusDays(3), 0L, "UPCOMING");
        seedAuction(productId3, null, now.plusDays(3), now.plusDays(4), 0L, "UPCOMING");
        seedAuction(productId4, bobId, now.plusDays(4), now.plusDays(5), 0L, "UPCOMING");
        seedAuction(productId5, aliceId, now.plusDays(5), now.plusDays(6), 0L, "UPCOMING");
        seedAuction(productId6, bobId, now.plusDays(6), now.plusDays(7), 0L, "UPCOMING");
        seedAuction(productId7, aliceId, now.plusDays(7), now.plusDays(8), 0L, "UPCOMING");
        seedAuction(productId8, bobId, now.plusDays(8), now.plusDays(9), 0L, "UPCOMING");

        // Demo: refresh the first few auctions to near-future LIVE 3-minute windows
        // so the deposit -> bid flow can be tested quickly after each startup.
        // (Runs last so it owns the final state of the demo auctions.)
        seedDemoLiveAuctions();
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
        ensureColumn("Auctions", "AuctionMode", "NVARCHAR(10) NOT NULL DEFAULT 'TIMED'");
        ensureColumn("Auctions", "ScheduledDurationSeconds", "BIGINT NULL");
        jdbcTemplate.update("UPDATE Products SET SubmittedAt = COALESCE(SubmittedAt, CreatedAt, SYSDATETIME())");
        jdbcTemplate.update("UPDATE Products SET TaxPercent = COALESCE(TaxPercent, 5) WHERE TaxPercent IS NULL");
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
                            "CccdNumber NVARCHAR(20) NOT NULL UNIQUE, " +
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
                               Long startingPrice, Long stepPrice, String status, LocalDateTime now) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Products WHERE ProductName = ?", Integer.class, name);
        if (count != null && count > 0) return;
        jdbcTemplate.update(
                "INSERT INTO Products (SellerId, CategoryId, ProductName, Description, ImagesUrl, [Condition], Brand, Origin, WeightSize, StartingPrice, StepPrice, Status, SubmittedAt, CreatedAt, TaxPercent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                sellerId, categoryId, name, description, "[]", "GOOD", "BrandX", "Vietnam", "Standard",
                startingPrice, stepPrice, status, now, now, 5
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

    private void seedAuction(Long productId, Long winnerUserId, LocalDateTime startTime, LocalDateTime endTime, Long highestBid, String status) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Auctions WHERE ProductId = ?", Integer.class, productId);
        if (count != null && count > 0) return;
        // The auction's current price starts at the product's starting price so the
        // storefront shows the real opening price (not 0) and the first bid must
        // be startingPrice + step.
        Long startingPrice = jdbcTemplate.queryForObject(
                "SELECT StartingPrice FROM Products WHERE ProductId = ?", Long.class, productId);
        long openingBid = startingPrice != null ? startingPrice : (highestBid != null ? highestBid : 0L);
        jdbcTemplate.update(
                "INSERT INTO Auctions (ProductId, StartTime, EndTime, CurrentHighestBid, CurrentWinnerUserId, Status, AuctionMode, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                productId, startTime, endTime, openingBid, winnerUserId, status, "LIVE", LocalDateTime.now()
        );
    }

    /**
     * Refreshes a few demo auctions on every startup so the full deposit -> bid flow
     * is testable quickly: LIVE mode, starting a few minutes from now, 3-minute window.
     * Deposit closes 3 minutes before start, so start offsets give increasing deposit time.
     */
    private void seedDemoLiveAuctions() {
        LocalDateTime now = LocalDateTime.now();
        long[] startOffsetMinutes = {5L, 10L, 15L};
        for (int i = 0; i < startOffsetMinutes.length; i++) {
            Long auctionId = jdbcTemplate.query(
                    "SELECT AuctionId FROM Auctions ORDER BY AuctionId OFFSET ? ROWS FETCH NEXT 1 ROWS ONLY",
                    rs -> rs.next() ? rs.getLong(1) : null,
                    i
            );
            if (auctionId == null) continue;
            LocalDateTime start = now.plusMinutes(startOffsetMinutes[i]);
            LocalDateTime end = start.plusSeconds(180);
            // Reset the opening price to the product's starting price (not 0).
            jdbcTemplate.update(
                    "UPDATE Auctions SET StartTime = ?, EndTime = ?, Status = 'UPCOMING', AuctionMode = 'LIVE', "
                            + "CurrentHighestBid = (SELECT StartingPrice FROM Products WHERE ProductId = Auctions.ProductId), "
                            + "CurrentWinnerUserId = NULL WHERE AuctionId = ?",
                    start, end, auctionId
            );
            // Clear stale bid history so each demo run starts clean.
            jdbcTemplate.update("DELETE FROM Bids WHERE AuctionId = ?", auctionId);
        }
    }
}
