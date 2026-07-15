-- Fix duplicate usernames that break JWT auth (subject must resolve to a single user).
USE SWP_Nhom3_App;
GO

SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
GO

UPDATE dbo.Users
SET Username = N'admingmail'
WHERE Email = N'admin@gmail.com' AND Username = N'admin';

UPDATE dbo.Users
SET Username = N'adminseed'
WHERE Email = N'admin@example.com' AND Username = N'admin';

SELECT UserId, Username, Email, RoleId
FROM dbo.Users
WHERE Username = N'admin' OR Email LIKE N'%admin%'
ORDER BY UserId;
