-- SQL Server migration.
-- Registration is email-only; phone is collected and verified after login.

DECLARE @phoneUniqueConstraint NVARCHAR(128);
SELECT TOP 1 @phoneUniqueConstraint = kc.name
FROM sys.key_constraints kc
JOIN sys.index_columns ic
  ON ic.object_id = kc.parent_object_id
 AND ic.index_id = kc.unique_index_id
JOIN sys.columns c
  ON c.object_id = ic.object_id
 AND c.column_id = ic.column_id
WHERE kc.parent_object_id = OBJECT_ID('dbo.Users')
  AND kc.type = 'UQ'
  AND c.name = 'Phone';

IF @phoneUniqueConstraint IS NOT NULL
    EXEC('ALTER TABLE dbo.Users DROP CONSTRAINT [' + @phoneUniqueConstraint + ']');
GO

ALTER TABLE dbo.Users ALTER COLUMN Phone NVARCHAR(20) NULL;
GO

IF COL_LENGTH('dbo.Users', 'PhoneVerified') IS NULL
    ALTER TABLE dbo.Users ADD PhoneVerified BIT NOT NULL
        CONSTRAINT DF_Users_PhoneVerified DEFAULT 0;
GO

IF COL_LENGTH('dbo.Users', 'PhoneVerifiedAt') IS NULL
    ALTER TABLE dbo.Users ADD PhoneVerifiedAt DATETIME2 NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_Users_Phone_NotNull'
      AND object_id = OBJECT_ID('dbo.Users')
)
    CREATE UNIQUE INDEX UX_Users_Phone_NotNull
        ON dbo.Users(Phone)
        WHERE Phone IS NOT NULL;
GO
