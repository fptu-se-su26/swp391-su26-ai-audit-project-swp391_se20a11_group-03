-- Find verified sellers missing a persisted SELLER_AGREEMENT contract.
-- After deploying the seller-contract flow fix, affected users can heal by visiting
-- /become-seller → acknowledge → "Gửi đăng ký Seller" (no manual SQL insert needed).
USE SWP_Nhom3_App;
GO

SET NOCOUNT ON;

PRINT '=== Sellers with KYC verified but no SELLER_AGREEMENT row ===';
SELECT u.UserId,
       u.Username,
       u.Email,
       u.IdentityVerified,
       r.RoleName
FROM dbo.Users u
INNER JOIN dbo.Roles r ON r.RoleId = u.RoleId AND r.RoleName = N'Seller'
LEFT JOIN dbo.Contracts c
    ON c.ReferenceId = u.UserId AND c.ContractType = N'SELLER_AGREEMENT'
WHERE u.IdentityVerified = 1
  AND c.ContractId IS NULL
ORDER BY u.UserId;

PRINT '=== Users (buyer role) verified, may need become-seller submit ===';
SELECT u.UserId, u.Username, u.Email, r.RoleName
FROM dbo.Users u
INNER JOIN dbo.Roles r ON r.RoleId = u.RoleId AND r.RoleName = N'User'
LEFT JOIN dbo.Contracts c
    ON c.ReferenceId = u.UserId AND c.ContractType = N'SELLER_AGREEMENT'
WHERE u.IdentityVerified = 1
  AND c.ContractId IS NULL
ORDER BY u.UserId;
