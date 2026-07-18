-- SQL Server migration.
-- Stores short-lived OTP challenges completed before account creation.

IF OBJECT_ID('dbo.PendingEmailVerifications', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PendingEmailVerifications (
        VerificationId         BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        Email                  NVARCHAR(255) NOT NULL,
        OtpSalt                NVARCHAR(64)  NOT NULL,
        OtpHash                NVARCHAR(64)  NOT NULL,
        RegistrationTokenHash  NVARCHAR(64)  NULL,
        AttemptCount           INT           NOT NULL DEFAULT 0,
        ExpiresAt              DATETIME2     NOT NULL,
        VerifiedAt             DATETIME2     NULL,
        ConsumedAt             DATETIME2     NULL,
        CreatedAt              DATETIME2     NOT NULL DEFAULT SYSDATETIME()
    );
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_PendingEmailVerifications_Email_CreatedAt'
      AND object_id = OBJECT_ID('dbo.PendingEmailVerifications')
)
    CREATE INDEX IX_PendingEmailVerifications_Email_CreatedAt
        ON dbo.PendingEmailVerifications(Email, CreatedAt DESC);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_PendingEmailVerifications_RegistrationToken'
      AND object_id = OBJECT_ID('dbo.PendingEmailVerifications')
)
    CREATE UNIQUE INDEX UX_PendingEmailVerifications_RegistrationToken
        ON dbo.PendingEmailVerifications(RegistrationTokenHash)
        WHERE RegistrationTokenHash IS NOT NULL;
GO
