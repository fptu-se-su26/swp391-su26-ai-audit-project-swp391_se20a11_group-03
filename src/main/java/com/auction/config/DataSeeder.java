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
        ensureRole("Admin");
        ensureRole("Staff");
        ensureRole("Seller");
        ensureRole("User");
        ensureProductSchemaColumns();
        ensureCategorySchemaColumns();
        ensureUserPasswordHashColumn();

        Long sellerRoleId = jdbcTemplate.queryForObject("SELECT TOP 1 RoleId FROM Roles WHERE RoleName = ?", Long.class, "Seller");
        Long userRoleId = jdbcTemplate.queryForObject("SELECT TOP 1 RoleId FROM Roles WHERE RoleName = ?", Long.class, "User");
        Long staffRoleId = jdbcTemplate.queryForObject("SELECT TOP 1 RoleId FROM Roles WHERE RoleName = ?", Long.class, "Staff");

        ensureCategory("Art", "Artwork and paintings");
        ensureCategory("Luxury Watch", "Premium watches");
        ensureCategory("Jewelry", "Fine jewelry and gemstones");
        ensureCategory("Automotive", "Classic and collectible vehicles");
        ensureCategory("Furniture", "Designer and antique furniture");
        ensureCategory("Ceramics", "Porcelain, pottery, and decorative ceramics");

        Long artId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Art");
        Long watchId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Luxury Watch");
        Long jewelryId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Jewelry");
        Long automotiveId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Automotive");
        Long furnitureId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Furniture");
        Long ceramicsId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Ceramics");

        LocalDateTime now = LocalDateTime.now();

        ensureUser("Seller One", "seller1", "seller1@example.com", "0900000101", "SELLER001", sellerRoleId, "password", now);
        ensureUser("Alice Bidder", "alice", "alice@example.com", "0900000102", "ALICE001", userRoleId, "password", now);
        ensureUser("Bob Bidder", "bob", "bob@example.com", "0900000103", "BOB001", userRoleId, "password", now);
        ensureUser("Wallet Test User", "walletuser", "user@example.com", "0900000201", "WALLETUSER001", userRoleId, "password", now);
        ensureUser("Wallet Staff", "walletstaff", "staff@example.com", "0900000202", "WALLETSTAFF001", staffRoleId, "password", now);

        Long sellerId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Username = ?", Long.class, "seller1");
        Long aliceId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Username = ?", Long.class, "alice");
        Long bobId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Username = ?", Long.class, "bob");
        Long walletUserId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Email = ?", Long.class, "user@example.com");

        ensureWallet(sellerId, 10000000L);
        ensureWallet(aliceId, 5000000L);
        ensureWallet(bobId, 8000000L);
        ensureWallet(walletUserId, 5000000L);

        insertProduct(sellerId, artId, "Vintage Painting", "A beautiful vintage painting.", 1000000L, 100000L, "ACTIVE", now);
        insertProduct(sellerId, watchId, "Rolex Classic", "Classic luxury watch.", 5000000L, 200000L, "ACTIVE", now);
        insertProduct(sellerId, artId, "Modern Abstract Canvas", "Colorful abstract artwork.", 1800000L, 100000L, "ACTIVE", now);
        insertProduct(sellerId, watchId, "Omega Seamaster", "Diving watch with stainless steel case.", 7200000L, 200000L, "ACTIVE", now);
        insertProduct(sellerId, artId, "Golden Frame Portrait", "Hand-painted portrait in a golden frame.", 2500000L, 150000L, "ACTIVE", now);
        insertProduct(sellerId, watchId, "Cartier Tank Must", "Elegant rectangular luxury watch.", 6100000L, 200000L, "ACTIVE", now);
        insertProduct(sellerId, artId, "Landscape Oil Painting", "Detailed landscape oil painting.", 1400000L, 100000L, "ACTIVE", now);
        insertProduct(sellerId, watchId, "Audemars Piguet Royal Oak", "Iconic luxury sports watch.", 21000000L, 500000L, "ACTIVE", now);
        insertProduct(sellerId, jewelryId, "Emerald Halo Ring", "18k gold ring with a vivid emerald center stone.", 3200000L, 150000L, "ACTIVE", now);
        insertProduct(sellerId, jewelryId, "Diamond Tennis Bracelet", "White gold bracelet with round brilliant diamonds.", 8800000L, 250000L, "ACTIVE", now);
        insertProduct(sellerId, automotiveId, "1967 Mustang Fastback", "Restored classic muscle car with matching numbers.", 45000000L, 1000000L, "ACTIVE", now);
        insertProduct(sellerId, automotiveId, "Vespa Primavera 1978", "Collectible scooter in excellent running condition.", 2600000L, 100000L, "ACTIVE", now);
        insertProduct(sellerId, furnitureId, "Eames Lounge Chair", "Mid-century lounge chair and ottoman set.", 4200000L, 150000L, "ACTIVE", now);
        insertProduct(sellerId, furnitureId, "French Walnut Writing Desk", "Carved antique writing desk with brass pulls.", 3600000L, 150000L, "ACTIVE", now);
        insertProduct(sellerId, ceramicsId, "Ming Style Porcelain Vase", "Blue and white porcelain display vase.", 1900000L, 100000L, "ACTIVE", now);
        insertProduct(sellerId, ceramicsId, "Royal Doulton Flambe Bowl", "Collectible flambe glaze ceramic bowl.", 1300000L, 100000L, "ACTIVE", now);
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

        seedAuction(productId, bobId, now.plusHours(2), now.plusDays(1), 0L, "UPCOMING");
        seedAuction(productId2, aliceId, now.plusHours(3), now.plusDays(1).plusHours(1), 0L, "UPCOMING");
        seedAuction(productId3, null, now.plusHours(4), now.plusDays(1).plusHours(2), 0L, "UPCOMING");
        seedAuction(productId4, bobId, now.plusHours(5), now.plusDays(1).plusHours(3), 0L, "UPCOMING");
        seedAuction(productId5, aliceId, now.plusHours(6), now.plusDays(1).plusHours(4), 0L, "UPCOMING");
        seedAuction(productId6, bobId, now.plusHours(7), now.plusDays(1).plusHours(5), 0L, "UPCOMING");
        seedAuction(productId7, aliceId, now.plusHours(8), now.plusDays(1).plusHours(6), 0L, "UPCOMING");
        seedAuction(productId8, bobId, now.plusHours(9), now.plusDays(1).plusHours(7), 0L, "UPCOMING");

        Long auctionId = jdbcTemplate.queryForObject("SELECT TOP 1 AuctionId FROM Auctions WHERE ProductId = ?", Long.class, productId);

        jdbcTemplate.update(
                "IF NOT EXISTS (SELECT 1 FROM Bids WHERE AuctionId = ? AND UserId = ? AND BidAmount = ?) INSERT INTO Bids (AuctionId, UserId, BidAmount, BidTime) VALUES (?, ?, ?, ?)",
                auctionId, aliceId, 1200000L, auctionId, aliceId, 1200000L, now.minusMinutes(30)
        );
        jdbcTemplate.update(
                "IF NOT EXISTS (SELECT 1 FROM Bids WHERE AuctionId = ? AND UserId = ? AND BidAmount = ?) INSERT INTO Bids (AuctionId, UserId, BidAmount, BidTime) VALUES (?, ?, ?, ?)",
                auctionId, bobId, 1500000L, auctionId, bobId, 1500000L, now.minusMinutes(10)
        );
    }

    private void ensureRole(String roleName) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Roles WHERE RoleName = ?", Integer.class, roleName);
        if (count != null && count > 0) return;
        jdbcTemplate.update("INSERT INTO Roles (RoleName) VALUES (?)", roleName);
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
        ensureColumn("Products", "SubmittedAt", "DATETIME2 NULL");
        ensureColumn("Products", "RejectionReason", "NVARCHAR(500) NULL");
        jdbcTemplate.update("UPDATE Products SET SubmittedAt = COALESCE(SubmittedAt, CreatedAt, SYSDATETIME())");
    }

    private void ensureCategorySchemaColumns() {
        ensureColumn("Categories", "IsActive", "BIT NULL");
        ensureColumn("Categories", "CreatedAt", "DATETIME2 NULL");
        jdbcTemplate.update("UPDATE Categories SET IsActive = COALESCE(IsActive, 1), CreatedAt = COALESCE(CreatedAt, SYSDATETIME())");
    }

    private void ensureColumn(String tableName, String columnName, String definition) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?",
                Integer.class,
                tableName,
                columnName
        );
        if (count != null && count > 0) return;

        jdbcTemplate.execute("ALTER TABLE " + tableName + " ADD " + columnName + " " + definition);
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
                            Long roleId, String password, LocalDateTime now) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Users WHERE Email = ?", Integer.class, email);
        String salt = PasswordUtil.generateSalt();
        int iterations = PasswordUtil.getIterations();
        String passwordHash = PasswordUtil.hashPassword(password, salt, iterations);

        if (count != null && count > 0) {
            jdbcTemplate.update(
                    "UPDATE Users SET " + passwordHashAssignment() + ", Salt = ?, PasswordIterations = ?, IsActive = 1, ProfileStatus = ?, VerificationLevel = ?, RoleId = ? WHERE Email = ?",
                    passwordHash, salt, iterations, "VERIFIED", 2, roleId, email
            );
            if (hasColumn("Users", "Username")) {
                jdbcTemplate.update("UPDATE Users SET Username = ? WHERE Email = ?", username, email);
            }
            if (hasColumn("Users", "Status")) {
                jdbcTemplate.update("UPDATE Users SET Status = ? WHERE Email = ?", "ACTIVE", email);
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
        addColumnValue(columns, values, "IdentityVerified", true);
        addColumnValue(columns, values, "IdentityVerifiedAt", now);
        addColumnValue(columns, values, "VerificationLevel", 2);
        addColumnValue(columns, values, "ProfileStatus", "VERIFIED");
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

    private void seedAuction(Long productId, Long winnerUserId, LocalDateTime startTime, LocalDateTime endTime, Long highestBid, String status) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Auctions WHERE ProductId = ?", Integer.class, productId);
        if (count != null && count > 0) return;
        jdbcTemplate.update(
                "INSERT INTO Auctions (ProductId, StartTime, EndTime, CurrentHighestBid, CurrentWinnerUserId, Status, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
                productId, startTime, endTime, highestBid, winnerUserId, status, LocalDateTime.now()
        );
    }
}
