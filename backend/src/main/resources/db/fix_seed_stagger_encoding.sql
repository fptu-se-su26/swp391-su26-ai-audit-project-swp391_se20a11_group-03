-- Fix [SEED-STAGGER] product titles (ASCII Vietnamese, safe for sqlcmd on Windows)
USE SWP_Nhom3_App;
GO

SET NOCOUNT ON;

UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 01 - Longines Heritage Classic',        Description = N'Dong ho co Longines Heritage, mat trang, day da nau.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 01%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 02 - Tranh son dau phong canh',       Description = N'Tranh son dau 80x100cm, khung go mun.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 02%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 03 - Nhan sapphire xanh 3ct',         Description = N'Nhan vang trang 18K, da sapphire Ceylon.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 03%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 04 - BMW 320i E46 2003',              Description = N'BMW 320i sedan, noi that da, bao duong day du.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 04%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 05 - Ghe Barcelona thiet ke',        Description = N'Ghe Barcelona boc da den, khung thep ma chrome.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 05%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 06 - Binh hoa men lam Bat Trang',     Description = N'Binh hoa men lam thoi Nguyen, nguyen ven.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 06%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 07 - Rolex Datejust 41',               Description = N'Rolex Datejust 41mm, thep vang Rolesor, hop sach.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 07%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 08 - Tranh in gioi han Picasso',       Description = N'Ban in co so thu tu, khung museum glass.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 08%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 09 - Vong co ngoc trai South Sea',     Description = N'Chuoi ngoc trai vang 12-14mm, khoa vang 18K.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 09%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 10 - Mercedes-Benz W113 Pagoda',       Description = N'Mercedes 280SL Pagoda, mau xanh classic.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 10%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 11 - Ban go oc cho George III',       Description = N'Ban console go oc cho khac tay the ky 18.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 11%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 12 - Gom Satsuma Nhat Ban',            Description = N'Binh doi Satsuma men vang, thoi Meiji.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 12%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 13 - Audemars Piguet Royal Oak',       Description = N'AP Royal Oak 15500ST, thep khong gi, full set.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 13%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 14 - Tranh thuy mac thieu nu',        Description = N'Tranh thuy mac tren lua, co tho tong.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 14%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 15 - Kim cuong solitaire 2ct',        Description = N'Nhan kim cuong GIA 2.01ct, VS1, vang trang.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 15%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 16 - Porsche 911 Carrera 1987',       Description = N'Porsche 911 Carrera G50, mau do Guards.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 16%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 17 - Den chum pha le Bohemian',       Description = N'Den chum pha le Bohemian 12 nhanh, the ky 19.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 17%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 18 - Dong xu vang co trieu Nguyen',   Description = N'Bo 5 dong xu vang Bao Dai, nguyen seal.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 18%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 19 - Patek Philippe Nautilus',        Description = N'Patek Nautilus 5711/1A, thep, hop sach day du.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 19%';
UPDATE dbo.Products SET ProductName = N'[SEED-STAGGER] Lot 20 - Tuong dong Art Deco',            Description = N'Tuong dong patina Art Deco Phap, cao 45cm.' WHERE ProductName LIKE N'%SEED-STAGGER] Lot 20%';

PRINT N'Fixed [SEED-STAGGER] product text (20 lots).';
GO
