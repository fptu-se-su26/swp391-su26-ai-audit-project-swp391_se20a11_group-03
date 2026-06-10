package com.auction.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
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

        Long sellerRoleId = jdbcTemplate.queryForObject("SELECT TOP 1 RoleId FROM Roles WHERE RoleName = ?", Long.class, "Seller");
        Long userRoleId = jdbcTemplate.queryForObject("SELECT TOP 1 RoleId FROM Roles WHERE RoleName = ?", Long.class, "User");

        ensureCategory("Art", "Artwork and paintings");
        ensureCategory("Luxury Watch", "Premium watches");

        Long artId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Art");
        Long watchId = jdbcTemplate.queryForObject("SELECT TOP 1 CategoryId FROM Categories WHERE CategoryName = ?", Long.class, "Luxury Watch");

        LocalDateTime now = LocalDateTime.now();

        ensureUser("seller1", "seller1@example.com", sellerRoleId, now);
        ensureUser("alice", "alice@example.com", userRoleId, now);
        ensureUser("bob", "bob@example.com", userRoleId, now);

        Long sellerId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Username = ?", Long.class, "seller1");
        Long aliceId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Username = ?", Long.class, "alice");
        Long bobId = jdbcTemplate.queryForObject("SELECT TOP 1 UserId FROM Users WHERE Username = ?", Long.class, "bob");

        ensureWallet(sellerId, 10000000L);
        ensureWallet(aliceId, 5000000L);
        ensureWallet(bobId, 8000000L);

        insertProduct(sellerId, artId, "Vintage Painting", "A beautiful vintage painting.", 1000000L, 100000L, now);
        insertProduct(sellerId, watchId, "Rolex Classic", "Classic luxury watch.", 5000000L, 200000L, now);
        insertProduct(sellerId, artId, "Modern Abstract Canvas", "Colorful abstract artwork.", 1800000L, 100000L, now);
        insertProduct(sellerId, watchId, "Omega Seamaster", "Diving watch with stainless steel case.", 7200000L, 200000L, now);
        insertProduct(sellerId, artId, "Golden Frame Portrait", "Hand-painted portrait in a golden frame.", 2500000L, 150000L, now);
        insertProduct(sellerId, watchId, "Cartier Tank Must", "Elegant rectangular luxury watch.", 6100000L, 200000L, now);
        insertProduct(sellerId, artId, "Landscape Oil Painting", "Detailed landscape oil painting.", 1400000L, 100000L, now);
        insertProduct(sellerId, watchId, "Audemars Piguet Royal Oak", "Iconic luxury sports watch.", 21000000L, 500000L, now);

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
        if (count != null && count > 0) return;
        jdbcTemplate.update("INSERT INTO Categories (CategoryName, Description) VALUES (?, ?)", categoryName, description);
    }

    private void ensureUser(String username, String email, Long roleId, LocalDateTime now) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Users WHERE Username = ?", Integer.class, username);
        if (count != null && count > 0) return;
        jdbcTemplate.update(
                "INSERT INTO Users (RoleId, Username, Email, AuthProvider, Status, CreatedAt) VALUES (?, ?, ?, ?, ?, ?)",
                roleId, username, email, "LOCAL", "ACTIVE", now
        );
    }

    private void insertProduct(Long sellerId, Long categoryId, String name, String description,
                               Long startingPrice, Long stepPrice, LocalDateTime now) {
        Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM Products WHERE ProductName = ?", Integer.class, name);
        if (count != null && count > 0) return;
        jdbcTemplate.update(
                "INSERT INTO Products (SellerId, CategoryId, ProductName, Description, ImagesUrl, [Condition], Brand, Origin, WeightSize, StartingPrice, StepPrice, Status, CreatedAt, TaxPercent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                sellerId, categoryId, name, description, "[]", "GOOD", "BrandX", "Vietnam", "Standard",
                startingPrice, stepPrice, "ACTIVE", now, 5
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
