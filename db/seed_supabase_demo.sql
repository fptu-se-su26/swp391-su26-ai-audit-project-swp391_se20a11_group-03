-- =============================================================================
-- Seed demo cho Supabase (PostgreSQL): 1 seller + 5 sản phẩm + 5 phiên ACTIVE
-- Chạy lại nhiều lần an toàn (idempotent theo email / tên sản phẩm).
-- =============================================================================

-- Seller demo (không dùng để đăng nhập)
INSERT INTO Users (RoleId, Username, FullName, Email, Phone,
                   PasswordHash, Salt, PasswordIterations,
                   EmailVerified, IdentityVerified, VerificationLevel, ProfileStatus)
SELECT r.RoleId, 'demoseller', 'Demo Seller', 'demoseller@bidzone.local', '0900000099',
       'x', 'x', 1, TRUE, TRUE, 2, 'VERIFIED'
FROM Roles r
WHERE r.RoleName = 'Seller'
  AND NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'demoseller@bidzone.local');

-- 5 sản phẩm APPROVED
INSERT INTO Products (SellerId, CategoryId, ProductName, Description, StartingPrice, Status)
SELECT u.UserId, c.CategoryId, p.name, p.descr, p.price, 'APPROVED'
FROM (VALUES
    ('Rolex Submariner 126610LN', 'Đồng hồ lặn thép Oystersteel 41mm, sản xuất 2023, fullbox.', 250000000::BIGINT, 'Luxury Watch'),
    ('Tranh sơn dầu Phố cổ Hà Nội', 'Tranh sơn dầu khổ 80x120cm của họa sĩ đương đại, khung gỗ sồi.', 45000000::BIGINT, 'Art'),
    ('Nhẫn kim cương 2.5 carat', 'Kim cương tự nhiên giác cắt tròn, kiểm định GIA, ổ vàng trắng 18k.', 480000000::BIGINT, 'Jewelry'),
    ('Bình gốm men lam thế kỷ 19', 'Bình gốm cổ men lam vẽ tay, cao 42cm, tình trạng nguyên vẹn.', 68000000::BIGINT, 'Ceramics'),
    ('Tủ gỗ trắc chạm khắc', 'Tủ thờ gỗ trắc chạm tứ linh, chế tác thủ công, niên đại ~60 năm.', 120000000::BIGINT, 'Furniture')
) AS p(name, descr, price, cat)
JOIN Users u ON u.Email = 'demoseller@bidzone.local'
JOIN Categories c ON c.CategoryName = p.cat
WHERE NOT EXISTS (SELECT 1 FROM Products x WHERE x.ProductName = p.name);

-- Ảnh chính cho từng sản phẩm (Unsplash)
INSERT INTO ProductImages (ProductId, ImageUrl, IsPrimary)
SELECT pr.ProductId, i.url, TRUE
FROM (VALUES
    ('Rolex Submariner 126610LN',  'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80'),
    ('Tranh sơn dầu Phố cổ Hà Nội', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&q=80'),
    ('Nhẫn kim cương 2.5 carat',    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80'),
    ('Bình gốm men lam thế kỷ 19',  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80'),
    ('Tủ gỗ trắc chạm khắc',        'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80')
) AS i(pname, url)
JOIN Products pr ON pr.ProductName = i.pname
WHERE NOT EXISTS (SELECT 1 FROM ProductImages x WHERE x.ProductId = pr.ProductId);

-- Phiên đấu giá ACTIVE cho từng sản phẩm (kết thúc 2–6 tiếng nữa)
INSERT INTO Auctions (ProductId, AuctionMode, StartTime, EndTime, CurrentHighestBid, Status)
SELECT pr.ProductId, 'TIMED',
       NOW() - INTERVAL '1 hour',
       NOW() + (a.hours || ' hours')::INTERVAL,
       pr.StartingPrice,
       'ACTIVE'
FROM (VALUES
    ('Rolex Submariner 126610LN', 3),
    ('Tranh sơn dầu Phố cổ Hà Nội', 2),
    ('Nhẫn kim cương 2.5 carat', 5),
    ('Bình gốm men lam thế kỷ 19', 4),
    ('Tủ gỗ trắc chạm khắc', 6)
) AS a(pname, hours)
JOIN Products pr ON pr.ProductName = a.pname
WHERE NOT EXISTS (SELECT 1 FROM Auctions x WHERE x.ProductId = pr.ProductId);

SELECT p.ProductName, a.Status, a.EndTime
FROM Auctions a JOIN Products p ON p.ProductId = a.ProductId
ORDER BY a.AuctionId;
