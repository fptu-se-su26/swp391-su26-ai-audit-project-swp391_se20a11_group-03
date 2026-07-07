// Toàn bộ dữ liệu trong file này là MOCK — chưa có API thật.
// Xem UI-STRUCTURE.md mục 10 để biết trang nào dùng export nào.

export type UserRole = "collector" | "seller" | "staff" | "admin";

export const mockUser = {
  name: "Nguyễn Minh Anh",
  email: "minhanh@luxora.vn",
  phone: "+84 90 123 4567",
  role: "collector" as UserRole,
  avatar:
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop",
  walletBalance: 128000,
  lockedDeposits: 15000,
};

export type ActiveBid = {
  id: string;
  lotNumber: string;
  title: string;
  currentBid: number;
  timeLeft: string;
  status: "leading" | "outbid";
  image: string;
};

export const mockActiveBids: ActiveBid[] = [
  {
    id: "1",
    lotNumber: "LOT 014",
    title: "Patek Philippe Nautilus 5711",
    currentBid: 185000,
    timeLeft: "02:14:33",
    status: "leading",
    image:
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    lotNumber: "LOT 027",
    title: "Hermès Birkin 30 Togo Leather",
    currentBid: 42000,
    timeLeft: "05:40:02",
    status: "outbid",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    lotNumber: "LOT 003",
    title: "Rolex Daytona 116500LN",
    currentBid: 28750,
    timeLeft: "12:05:11",
    status: "leading",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop",
  },
];

export type WonItem = {
  id: string;
  date: string;
  lotNumber: string;
  title: string;
  winningBid: number;
  status: "paid" | "pending";
};

export const mockWonItems: WonItem[] = [
  { id: "1", date: "12/05/2026", lotNumber: "LOT 041", title: "Leica M11 Black Paint", winningBid: 6900, status: "paid" },
  { id: "2", date: "28/04/2026", lotNumber: "LOT 018", title: "Louis Vuitton Trunk 1920s", winningBid: 32500, status: "paid" },
  { id: "3", date: "09/04/2026", lotNumber: "LOT 052", title: "Chanel Classic Flap Bag", winningBid: 8900, status: "pending" },
  { id: "4", date: "22/03/2026", lotNumber: "LOT 007", title: "Audemars Piguet Royal Oak", winningBid: 62000, status: "paid" },
];

export type WatchlistItem = {
  id: string;
  lotNumber: string;
  title: string;
  currentBid: number;
  timeLeft: string;
  category: string;
  image: string;
};

export const mockWatchlist: WatchlistItem[] = [
  {
    id: "1",
    lotNumber: "LOT 009",
    title: "Cartier Panthère de Cartier",
    currentBid: 15400,
    timeLeft: "08:22:10",
    category: "Đồng hồ",
    image:
      "https://images.unsplash.com/photo-1548171915-e79a380a2a4b?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    lotNumber: "LOT 033",
    title: "Dom Pérignon Vintage 2004",
    currentBid: 2100,
    timeLeft: "01:15:45",
    category: "Rượu vang",
    image:
      "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    lotNumber: "LOT 061",
    title: "Basquiat Signed Lithograph",
    currentBid: 48000,
    timeLeft: "1 ngày 04:00:00",
    category: "Nghệ thuật",
    image:
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop",
  },
];

export type Transaction = {
  id: string;
  date: string;
  type: string;
  description: string;
  amount: number;
  status: "completed" | "locked";
};

export const mockTransactions: Transaction[] = [
  { id: "1", date: "01/07/2026", type: "Nạp tiền", description: "Nạp quỹ qua chuyển khoản", amount: 50000, status: "completed" },
  { id: "2", date: "28/06/2026", type: "Đặt cọc", description: "Cọc tham gia LOT 014", amount: -5000, status: "locked" },
  { id: "3", date: "20/06/2026", type: "Thanh toán", description: "Thanh toán LOT 041", amount: -6900, status: "completed" },
  { id: "4", date: "15/06/2026", type: "Hoàn cọc", description: "Hoàn cọc LOT 027 (bị vượt giá)", amount: 4200, status: "completed" },
];

export type InventoryItem = {
  id: string;
  title: string;
  category: string;
  startingBid: number;
  status: "live" | "pending" | "review";
  views: number;
  image: string;
};

export const mockInventory: InventoryItem[] = [
  {
    id: "1",
    title: "Rolex GMT-Master II Pepsi",
    category: "Đồng hồ",
    startingBid: 18500,
    status: "live",
    views: 2140,
    image:
      "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=400&h=400&fit=crop",
  },
  {
    id: "2",
    title: "Hermès Kelly 28 Epsom",
    category: "Túi xách",
    startingBid: 25000,
    status: "pending",
    views: 340,
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    title: "Bộ sưu tập tem cổ 1920-1950",
    category: "Đồ sưu tầm",
    startingBid: 4200,
    status: "review",
    views: 88,
    image:
      "https://images.unsplash.com/photo-1607344645866-009c320c5ab0?w=400&h=400&fit=crop",
  },
];

export type Payout = {
  id: string;
  date: string;
  ref: string;
  amount: number;
  destination: string;
  status: "processed" | "processing";
};

export const mockPayouts: Payout[] = [
  { id: "1", date: "30/06/2026", ref: "PO-20260630-001", amount: 18500, destination: "JPMorgan Chase ****4582", status: "processed" },
  { id: "2", date: "15/06/2026", ref: "PO-20260615-004", amount: 32000, destination: "JPMorgan Chase ****4582", status: "processed" },
  { id: "3", date: "01/07/2026", ref: "PO-20260701-002", amount: 6900, destination: "JPMorgan Chase ****4582", status: "processing" },
];

export const mockAdminStats = {
  totalRevenue: { value: 4820000, growth: 12.4 },
  completedTransactions: { value: 3240, growth: 8.1 },
  activeUsers: { value: 52300, growth: 5.6 },
  commissionEarned: { value: 482000, growth: 11.2 },
};

export type AuctionHistoryRow = {
  id: string;
  lotNumber: string;
  title: string;
  seller: string;
  buyer: string;
  salePrice: number;
  date: string;
  status: "completed" | "dispute" | "pending_payment";
};

const baseAuctionHistory: AuctionHistoryRow[] = [
  { id: "1", lotNumber: "LOT 014", title: "Patek Philippe Nautilus 5711", seller: "Trần Văn Đức", buyer: "Nguyễn Minh Anh", salePrice: 185000, date: "28/06/2026", status: "completed" },
  { id: "2", lotNumber: "LOT 027", title: "Hermès Birkin 30 Togo Leather", seller: "Lê Thu Hà", buyer: "Phạm Quốc Bảo", salePrice: 42000, date: "25/06/2026", status: "dispute" },
  { id: "3", lotNumber: "LOT 003", title: "Rolex Daytona 116500LN", seller: "Vũ Anh Tuấn", buyer: "Nguyễn Minh Anh", salePrice: 28750, date: "20/06/2026", status: "completed" },
  { id: "4", lotNumber: "LOT 041", title: "Leica M11 Black Paint", seller: "Đặng Gia Huy", buyer: "Ngô Thanh Trúc", salePrice: 6900, date: "12/06/2026", status: "pending_payment" },
];

export const mockAuctionHistory: AuctionHistoryRow[] = [
  ...baseAuctionHistory,
  ...baseAuctionHistory.map((row) => ({ ...row, id: `${row.id}-2` })),
];

export type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
  subcategories: string[];
};

export const mockCategories: Category[] = [
  { id: "1", name: "Đồng hồ", icon: "watch", count: 482, subcategories: ["Rolex", "Patek Philippe", "Audemars Piguet", "Cartier"] },
  { id: "2", name: "Túi xách", icon: "shopping_bag", count: 210, subcategories: ["Hermès", "Chanel", "Louis Vuitton"] },
  { id: "3", name: "Nghệ thuật", icon: "palette", count: 96, subcategories: ["Tranh sơn dầu", "Điêu khắc", "Bản in giới hạn"] },
  { id: "4", name: "Rượu vang", icon: "wine_bar", count: 158, subcategories: ["Bordeaux", "Champagne", "Vintage hiếm"] },
  { id: "5", name: "Trang sức", icon: "diamond", count: 341, subcategories: ["Kim cương", "Ngọc trai", "Đá quý màu"] },
  { id: "6", name: "Đồ sưu tầm", icon: "toys", count: 74, subcategories: ["Tem cổ", "Tiền xu", "Sách hiếm"] },
];

export type StaffApproval = {
  id: string;
  title: string;
  seller: string;
  category: string;
  submitted: string;
  estimatedValue: number;
  status: "pending" | "reviewing" | "approved" | "rejected";
};

export const mockStaffApprovals: StaffApproval[] = [
  { id: "1", title: "Rolex GMT-Master II Pepsi", seller: "Trần Văn Đức", category: "Đồng hồ", submitted: "03/07/2026", estimatedValue: 18500, status: "pending" },
  { id: "2", title: "Hermès Kelly 28 Epsom", seller: "Lê Thu Hà", category: "Túi xách", submitted: "02/07/2026", estimatedValue: 25000, status: "reviewing" },
  { id: "3", title: "Bộ sưu tập tem cổ 1920-1950", seller: "Vũ Anh Tuấn", category: "Đồ sưu tầm", submitted: "01/07/2026", estimatedValue: 4200, status: "pending" },
  { id: "4", title: "Chanel Classic Flap Bag", seller: "Đặng Gia Huy", category: "Túi xách", submitted: "30/06/2026", estimatedValue: 8900, status: "approved" },
  { id: "5", title: "Bức tranh sơn dầu thế kỷ 19", seller: "Ngô Thanh Trúc", category: "Nghệ thuật", submitted: "29/06/2026", estimatedValue: 56000, status: "rejected" },
];

export type Message = {
  id: string;
  sender: string;
  avatar: string;
  preview: string;
  time: string;
  unread: boolean;
  isStaff: boolean;
};

export const mockMessages: Message[] = [
  { id: "1", sender: "Hỗ trợ BidZone", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop", preview: "Yêu cầu xác minh KYC của bạn đã được duyệt.", time: "10:24", unread: true, isStaff: true },
  { id: "2", sender: "Trần Văn Đức", avatar: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop", preview: "Sản phẩm sẽ được vận chuyển trong tuần này.", time: "Hôm qua", unread: false, isStaff: false },
  { id: "3", sender: "Hỗ trợ BidZone", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop", preview: "Cảm ơn bạn đã liên hệ, chúng tôi sẽ phản hồi sớm.", time: "2 ngày trước", unread: false, isStaff: true },
];

export type RecentBid = {
  bidder: string;
  amount: number;
  time: string;
};

export const mockLiveAuction = {
  lotNumber: "LOT 014",
  collection: "Timepieces Grand Collection",
  title: "Patek Philippe Nautilus 5711/1A-010",
  timeRemaining: "02:14:33",
  currentBid: 185000,
  depositRequired: 18500,
  reserveMet: true,
  description:
    "Chiếc Patek Philippe Nautilus 5711/1A-010 mặt số xanh, phiên bản cuối cùng trước khi ngừng sản xuất. Tình trạng gần như nguyên bản, đầy đủ hộp và giấy tờ gốc.",
  specs: [
    { label: "Năm sản xuất", value: "2021" },
    { label: "Chất liệu", value: "Thép không gỉ" },
    { label: "Tình trạng", value: "Như mới" },
  ],
  images: [
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=1200&h=1200&fit=crop",
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1200&h=1200&fit=crop",
    "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1200&h=1200&fit=crop",
  ],
  recentBids: [
    { bidder: "N. Anh", amount: 185000, time: "2 phút trước" },
    { bidder: "P. Bảo", amount: 180000, time: "8 phút trước" },
    { bidder: "L. Hà", amount: 175000, time: "20 phút trước" },
  ] as RecentBid[],
};

export type StorefrontLot = {
  id: string;
  lotNumber: string;
  title: string;
  categoryId: string;
  currentBid: number;
  timeLeft: string;
  isLive: boolean;
  canConsign: boolean;
  image: string;
};

export const mockStorefrontLots: StorefrontLot[] = [
  {
    id: "1",
    lotNumber: "LOT 014",
    title: "Patek Philippe Nautilus 5711/1A-010",
    categoryId: "dong-ho",
    currentBid: 185000,
    timeLeft: "02:14:33",
    isLive: true,
    canConsign: true,
    image:
      "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&h=800&fit=crop",
  },
  {
    id: "2",
    lotNumber: "LOT 027",
    categoryId: "tui-xach",
    title: "Hermès Birkin 30 Togo Leather",
    currentBid: 42000,
    timeLeft: "05:40:02",
    isLive: true,
    canConsign: true,
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&h=800&fit=crop",
  },
  {
    id: "3",
    lotNumber: "LOT 003",
    categoryId: "dong-ho",
    title: "Rolex Daytona 116500LN",
    currentBid: 28750,
    timeLeft: "12:05:11",
    isLive: true,
    canConsign: false,
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&h=800&fit=crop",
  },
  {
    id: "4",
    lotNumber: "LOT 041",
    title: "Leica M11 Black Paint",
    categoryId: "may-anh",
    currentBid: 6900,
    timeLeft: "04:19:45",
    isLive: false,
    canConsign: true,
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop",
  },
  {
    id: "5",
    lotNumber: "LOT 052",
    title: "Chanel Classic Flap Bag",
    categoryId: "tui-xach",
    currentBid: 8900,
    timeLeft: "18:02:10",
    isLive: false,
    canConsign: true,
    image:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&h=800&fit=crop",
  },
  {
    id: "6",
    lotNumber: "LOT 066",
    title: "iPhone 15 Pro Max 1TB Titanium Black",
    categoryId: "dien-thoai",
    currentBid: 1250,
    timeLeft: "01:15:27",
    isLive: true,
    canConsign: false,
    image: "/images/auction-products/iphone-15-pro-max.png",
  },
  {
    id: "7",
    lotNumber: "LOT 072",
    title: "MacBook Pro 16 M3 Max 48GB",
    categoryId: "laptop",
    currentBid: 3250,
    timeLeft: "03:35:48",
    isLive: true,
    canConsign: false,
    image: "/images/auction-products/macbook-pro-m3-max.png",
  },
  {
    id: "8",
    lotNumber: "LOT 089",
    title: "AirPods Max Space Gray",
    categoryId: "tai-nghe",
    currentBid: 491,
    timeLeft: "01:45:41",
    isLive: false,
    canConsign: true,
    image: "/images/auction-products/airpods-max.png",
  },
  {
    id: "9",
    lotNumber: "LOT 103",
    title: "Sony PlayStation 5 Anniversary Bundle",
    categoryId: "do-dien-tu",
    currentBid: 980,
    timeLeft: "09:22:18",
    isLive: false,
    canConsign: true,
    image:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=800&fit=crop",
  },
  {
    id: "10",
    lotNumber: "LOT 117",
    title: "Cartier Diamond Love Bracelet",
    categoryId: "trang-suc",
    currentBid: 7600,
    timeLeft: "11:08:52",
    isLive: true,
    canConsign: true,
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
  },
];
