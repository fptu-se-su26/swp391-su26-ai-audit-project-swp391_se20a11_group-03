IF COL_LENGTH('dbo.Users', 'PremiumExpiresAt') IS NULL
    ALTER TABLE dbo.Users ADD PremiumExpiresAt DATETIME2 NULL;

-- Existing Premium accounts receive one month from migration time instead of expiring immediately.
EXEC(N'UPDATE dbo.Users
       SET PremiumExpiresAt = DATEADD(MONTH, 1, SYSUTCDATETIME())
       WHERE IsPremium = 1 AND PremiumExpiresAt IS NULL');
