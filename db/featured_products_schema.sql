-- Featured products curation (daily / weekly / monthly slots)
USE SWP_Nhom3_App;
GO

IF OBJECT_ID('dbo.FeaturedProducts', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.FeaturedProducts (
        FeaturedId    BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        PeriodType    NVARCHAR(10)         NOT NULL,
        ProductId     BIGINT               NOT NULL,
        DisplayOrder  INT                  NOT NULL,
        UpdatedAt     DATETIME2            NOT NULL DEFAULT SYSDATETIME(),
        UpdatedBy     BIGINT               NULL,
        CONSTRAINT UQ_Featured_Period_Order UNIQUE (PeriodType, DisplayOrder),
        CONSTRAINT FK_Featured_Product FOREIGN KEY (ProductId) REFERENCES dbo.Products(ProductId)
    );
    CREATE INDEX IX_FeaturedProducts_PeriodType ON dbo.FeaturedProducts(PeriodType);
END;
GO

PRINT 'FeaturedProducts table ready.';
GO
