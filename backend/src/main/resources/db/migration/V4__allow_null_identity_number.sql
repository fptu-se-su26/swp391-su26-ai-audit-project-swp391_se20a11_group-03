-- ============================================================
-- V4__allow_null_identity_number.sql
-- Allow Users.IdentityNumber to be NULL (CCCD moved to KYC step).
-- Keep uniqueness only when the value is not null.
-- ============================================================

-- 1) Drop the existing unique constraint (if any)
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_Users_IdentityNumber' AND object_id = OBJECT_ID('Users'))
    ALTER TABLE Users DROP CONSTRAINT UQ_Users_IdentityNumber;
GO

IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_IdentityNumber' AND object_id = OBJECT_ID('Users'))
    DROP INDEX IX_Users_IdentityNumber ON Users;
GO

-- 2) Allow NULL
ALTER TABLE Users ALTER COLUMN IdentityNumber NVARCHAR(20) NULL;
GO

-- 3) Recreate a unique filtered index so multiple NULLs are allowed
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Users_IdentityNumber_NotNull' AND object_id = OBJECT_ID('Users'))
    CREATE UNIQUE INDEX UX_Users_IdentityNumber_NotNull ON Users(IdentityNumber) WHERE IdentityNumber IS NOT NULL;
GO
