-- ========================================================
-- KHỞI TẠO DATABASE SWP_Nhom3
-- ========================================================
CREATE DATABASE SWP_Nhom3;
GO

USE SWP_Nhom3;
GO

-- ========================================================
-- 1. HỆ THỐNG & TÀI KHOẢN
-- ========================================================
CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Users (
    UserId BIGINT IDENTITY(1,1) PRIMARY KEY,
    RoleId INT NOT NULL,
    Username NVARCHAR(100) NULL UNIQUE,
    Email NVARCHAR(255) NULL UNIQUE,
    PasswordHash VARBINARY(256) NULL,
    PasswordSalt VARBINARY(128) NULL,
    AuthProvider NVARCHAR(30) NOT NULL, -- LOCAL, GOOGLE
    Status NVARCHAR(30) NOT NULL,       -- PENDING, ACTIVE, LOCKED, BANNED
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

CREATE TABLE KycProfiles (
    KycId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL UNIQUE,
    Phone NVARCHAR(20) NOT NULL,        -- Chỉ cần nhập SĐT, không OTP
    CccdNumber NVARCHAR(20) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Dob DATE NOT NULL,
    Gender NVARCHAR(10) NOT NULL,
    IssueDate DATE NOT NULL,
    IssuePlace NVARCHAR(255) NOT NULL,
    FrontImageUrl NVARCHAR(500) NOT NULL,
    BackImageUrl NVARCHAR(500) NOT NULL,
    SelfieImageUrl NVARCHAR(500) NOT NULL,
    Status NVARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    SubmittedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    ProcessedBy BIGINT NULL,            -- Admin/Staff nào duyệt
    ProcessedAt DATETIME2 NULL,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (ProcessedBy) REFERENCES Users(UserId)
);

-- ========================================================
-- 2. VÍ ĐIỆN TỬ & GIAO DỊCH (Tiền tệ dùng BIGINT)
-- ========================================================
CREATE TABLE Wallets (
    WalletId BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserId BIGINT NOT NULL UNIQUE,
    Balance BIGINT NOT NULL DEFAULT 0,
    HoldBalance BIGINT NOT NULL DEFAULT 0,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

CREATE TABLE Transactions (
    TransactionId BIGINT IDENTITY(1,1) PRIMARY KEY,
    WalletId BIGINT NOT NULL,
    Amount BIGINT NOT NULL,
    TransactionType NVARCHAR(50) NOT NULL, -- DEPOSIT, WITHDRAW, HOLD_BID, REFUND, FORFEIT, PAY_AUCTION
    Status NVARCHAR(30) NOT NULL,          -- PENDING (Chờ duyệt rút), COMPLETED, REJECTED, FAILED
    ReferenceCode NVARCHAR(100) NULL,      -- Mã giao dịch VNPay (nếu có)
    Description NVARCHAR(255) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (WalletId) REFERENCES Wallets(WalletId)
);

-- ========================================================
-- 3. SẢN PHẨM & XÉT DUYỆT
-- ========================================================
CREATE TABLE Categories (
    CategoryId INT IDENTITY(1,1) PRIMARY KEY,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(255) NULL
);

CREATE TABLE Products (
    ProductId BIGINT IDENTITY(1,1) PRIMARY KEY,
    SellerId BIGINT NOT NULL,
    CategoryId INT NOT NULL,
    ProductName NVARCHAR(255) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    ImagesUrl NVARCHAR(MAX) NULL,       -- Chứa mảng link ảnh hoặc JSON
    Condition NVARCHAR(50) NULL,
    Brand NVARCHAR(100) NULL,
    Origin NVARCHAR(100) NULL,
    WeightSize NVARCHAR(100) NULL,
    StartingPrice BIGINT NOT NULL,
    StepPrice BIGINT NOT NULL DEFAULT 1000000, -- Mặc định bước nhảy 1.000.000 VNĐ
    Status NVARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (SellerId) REFERENCES Users(UserId),
    FOREIGN KEY (CategoryId) REFERENCES Categories(CategoryId)
);

CREATE TABLE ProductApprovals (
    ApprovalId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId BIGINT NOT NULL,
    ReviewedBy BIGINT NOT NULL, -- Admin hoặc Staff
    Status NVARCHAR(30) NOT NULL, -- APPROVED, REJECTED
    Reason NVARCHAR(500) NULL,
    ReviewedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    FOREIGN KEY (ReviewedBy) REFERENCES Users(UserId)
);

-- ========================================================
-- 4. ĐẤU GIÁ & ĐẶT CỌC 10%
-- ========================================================
CREATE TABLE Auctions (
    AuctionId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ProductId BIGINT NOT NULL UNIQUE, -- 1 Product chỉ có 1 Auction
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2 NOT NULL,
    CurrentHighestBid BIGINT NOT NULL DEFAULT 0,
    CurrentWinnerUserId BIGINT NULL,
    Status NVARCHAR(30) NOT NULL,       -- UPCOMING, ACTIVE, ENDED, CANCELED
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (ProductId) REFERENCES Products(ProductId),
    FOREIGN KEY (CurrentWinnerUserId) REFERENCES Users(UserId)
);

CREATE TABLE Auction_Deposits (
    DepositId BIGINT IDENTITY(1,1) PRIMARY KEY,
    AuctionId BIGINT NOT NULL,
    UserId BIGINT NOT NULL,
    DepositAmount BIGINT NOT NULL,      -- 10% Starting Price
    Status NVARCHAR(30) NOT NULL DEFAULT 'LOCKED', -- LOCKED, REFUNDED, FORFEITED
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (AuctionId) REFERENCES Auctions(AuctionId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    UNIQUE (AuctionId, UserId)          -- Một user chỉ cọc 1 lần cho 1 phiên
);

CREATE TABLE Bids (
    BidId BIGINT IDENTITY(1,1) PRIMARY KEY,
    AuctionId BIGINT NOT NULL,
    UserId BIGINT NOT NULL,
    BidAmount BIGINT NOT NULL,
    BidTime DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (AuctionId) REFERENCES Auctions(AuctionId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
GO

CREATE TABLE Contracts (
    ContractId BIGINT IDENTITY(1,1) PRIMARY KEY,
    ContractType NVARCHAR(50) NOT NULL, -- 'LISTING' (Hợp đồng lên sàn) hoặc 'SALE' (Hợp đồng mua bán)
    ReferenceId BIGINT NOT NULL,        -- Lưu ProductId (nếu là LISTING) hoặc AuctionId (nếu là SALE)
    FileUrl NVARCHAR(500) NOT NULL,     -- Link file PDF hợp đồng (lưu trên Cloudinary/S3)
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);


ALTER TABLE Products 
ADD TaxPercent INT NOT NULL DEFAULT 5; -- Ví dụ mặc định sàn thu 5% thuế/phí trên mỗi sản phẩm

-- ========================================================
-- DỮ LIỆU MẪU (DUMMY DATA) CHO BẢNG ROLES
-- ========================================================
INSERT INTO Roles (RoleName) VALUES 
('Admin'), 
('Staff'), 
('Seller'), 
('User');
GO

