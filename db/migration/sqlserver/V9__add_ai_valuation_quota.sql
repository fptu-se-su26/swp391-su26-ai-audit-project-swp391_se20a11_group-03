-- SQL Server migration: AI valuation usage quota per user.
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Users') AND name = 'AiValuationUsedCount'
)
BEGIN
    ALTER TABLE dbo.Users ADD AiValuationUsedCount INT NOT NULL CONSTRAINT DF_Users_AiValuationUsedCount DEFAULT 0;
END
