CREATE DATABASE VNEC_Auth;
GO

USE VNEC_Auth;
GO

CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(150) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(20) NOT NULL,
    IdentityNumber NVARCHAR(20) NOT NULL,
    PasswordHash NVARCHAR(128) NOT NULL,
    Salt NVARCHAR(32) NOT NULL,
    PasswordIterations INT NOT NULL CONSTRAINT DF_Users_PasswordIterations DEFAULT (120000),
    IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT (1),
    EmailVerified BIT NOT NULL CONSTRAINT DF_Users_EmailVerified DEFAULT (0),
    EmailVerifiedAt DATETIME2 NULL,
    IdentityVerified BIT NOT NULL CONSTRAINT DF_Users_IdentityVerified DEFAULT (0),
    IdentityVerifiedAt DATETIME2 NULL,
    VerificationLevel TINYINT NOT NULL CONSTRAINT DF_Users_VerificationLevel DEFAULT (0),
    ProfileStatus NVARCHAR(30) NOT NULL CONSTRAINT DF_Users_ProfileStatus DEFAULT (N'PENDING_PROFILE'),
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT (SYSDATETIME()),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT UQ_Users_Email UNIQUE (Email),
    CONSTRAINT UQ_Users_Phone UNIQUE (Phone),
    CONSTRAINT UQ_Users_IdentityNumber UNIQUE (IdentityNumber)
);
GO

CREATE TABLE dbo.UserVerificationTokens (
    VerificationTokenID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    TokenHash NVARCHAR(128) NOT NULL,
    TokenType NVARCHAR(30) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    UsedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_UserVerificationTokens_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_UserVerificationTokens_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);
GO

CREATE TABLE dbo.PasswordResetTokens (
    PasswordResetTokenID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    TokenHash NVARCHAR(128) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    UsedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_PasswordResetTokens_CreatedAt DEFAULT (SYSDATETIME()),
    CONSTRAINT FK_PasswordResetTokens_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);
GO

CREATE TABLE dbo.IdentityDocuments (
    IdentityDocumentID BIGINT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    DocumentType NVARCHAR(20) NOT NULL,
    DocumentNumber NVARCHAR(20) NOT NULL,
    FullName NVARCHAR(150) NOT NULL,
    DateOfBirth DATE NULL,
    FrontImagePath NVARCHAR(500) NULL,
    BackImagePath NVARCHAR(500) NULL,
    OcrProvider NVARCHAR(50) NULL,
    OcrResultJson NVARCHAR(MAX) NULL,
    Status NVARCHAR(30) NOT NULL CONSTRAINT DF_IdentityDocuments_Status DEFAULT (N'PENDING_REVIEW'),
    ReviewedBy NVARCHAR(100) NULL,
    ReviewedAt DATETIME2 NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_IdentityDocuments_CreatedAt DEFAULT (SYSDATETIME()),
    UpdatedAt DATETIME2 NULL,
    CONSTRAINT FK_IdentityDocuments_Users FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);
GO

CREATE TABLE dbo.AuditLogs (
    AuditLogID BIGINT IDENTITY(1,1) PRIMARY KEY,
    Action NVARCHAR(30) NOT NULL,
    Success BIT NOT NULL,
    Subject NVARCHAR(255) NULL,
    Detail NVARCHAR(500) NULL,
    IpAddress NVARCHAR(64) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT (SYSDATETIME())
);
GO

CREATE INDEX IX_Users_Email ON dbo.Users (Email);
CREATE INDEX IX_Users_Phone ON dbo.Users (Phone);
CREATE INDEX IX_Users_IdentityNumber ON dbo.Users (IdentityNumber);
CREATE INDEX IX_AuditLogs_Action_CreatedAt ON dbo.AuditLogs (Action, CreatedAt);
CREATE INDEX IX_UserVerificationTokens_UserID_Type ON dbo.UserVerificationTokens (UserID, TokenType);
CREATE INDEX IX_PasswordResetTokens_UserID ON dbo.PasswordResetTokens (UserID);
CREATE INDEX IX_IdentityDocuments_UserID_Status ON dbo.IdentityDocuments (UserID, Status);
GO

INSERT INTO dbo.Users (
    FullName, Email, Phone, IdentityNumber, PasswordHash, Salt,
    PasswordIterations, IsActive, EmailVerified, IdentityVerified,
    VerificationLevel, ProfileStatus
)
VALUES (
    N'Test Server User',
    N'testuser@vnec.local',
    N'0900000000',
    N'001122334455',
    N'268381ae3ac9ece7d84309e6d446c9b8db80c9a9499322e27096524fe2b84c93',
    N'00112233445566778899aabbccddeeff',
    120000,
    1,
    1,
    0,
    1,
    N'PENDING_IDENTITY_VERIFY'
);
GO
