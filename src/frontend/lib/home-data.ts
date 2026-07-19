export type LiveAuctionItem = {
  id: string;
  title: string;
  subtitle: string;
  currentPrice: string;
  estimatedPrice: string;
  bidCount: number;
  endsAt: number;
  imageSrc: string;
};



export type FeatureItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export type TrustStat = {
  id: string;
  value: string;
  label: string;
};

export const DEFAULT_PUBLIC_STATS: TrustStat[] = [
  { id: "products", value: "500+", label: "Products" },
  { id: "members", value: "2K+", label: "Members" },
  { id: "active-auctions", value: "24/7", label: "Live sessions" },
  { id: "completed-auctions", value: "1K+", label: "Completed" },
];

export type AuctionProcessStep = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export type BrandItem = {
  id: string;
  name: string;
  mark: string;
};

export const NAV_LINKS = [
  { key: "home", label: "TRANG CHỦ", href: "/" },
  { key: "products", label: "SẢN PHẨM", href: "/storefront" },
  { key: "brands", label: "THƯƠNG HIỆU", href: "/brands" },
  { key: "about", label: "VỀ CHÚNG TÔI", href: "/about" },
];





export const WHY_CHOOSE_FEATURES: FeatureItem[] = [
  {
    id: "verified-sellers",
    icon: "verified_user",
    title: "HÀNG THẬT 100%",
    description: "Cam kết hàng chính hãng, đầy đủ giấy tờ và kiểm định.",
  },
  {
    id: "transparent",
    icon: "workspace_premium",
    title: "Đấu giá minh bạch",
    description: "Quy trình đấu giá công khai, rõ ràng, công bằng.",
  },
  {
    id: "secure-payment",
    icon: "encrypted",
    title: "Thanh toán an toàn",
    description: "Hệ thống thanh toán bảo mật, ký quỹ an toàn.",
  },
  {
    id: "support",
    icon: "diamond",
    title: "Hỗ trợ chuyên nghiệp",
    description: "Đội ngũ hỗ trợ 24/7, tư vấn tận tâm trước và sau đấu giá.",
  },
];

export const AUCTION_PROCESS_STEPS: AuctionProcessStep[] = [
  {
    id: "verify",
    icon: "person_check",
    title: "Xác minh tài khoản",
    description: "Đăng ký và xác minh để bảo mật tài khoản.",
  },
  {
    id: "deposit",
    icon: "inventory_2",
    title: "Nộp tiền đặt cọc",
    description: "Nạp tiền đặt cọc để tham gia phiên đấu giá.",
  },
  {
    id: "bid",
    icon: "computer",
    title: "Tham gia phiên live",
    description: "Theo dõi và trả giá trực tiếp trong phiên live.",
  },
  {
    id: "payment",
    icon: "local_shipping",
    title: "THANH TOÁN & NHẬN HÀNG",
    description: "Thanh toán an toàn và nhận hàng đúng cam kết.",
  },
];

export const BRAND_ITEMS: BrandItem[] = [
  { id: "rolex", name: "ROLEX", mark: "ROLEX" },
  { id: "apple", name: "APPLE", mark: "APPLE" },
  { id: "patek", name: "PATEK PHILIPPE", mark: "PATEK" },
  { id: "louis-vuitton", name: "LOUIS VUITTON", mark: "LV" },
  { id: "leica", name: "LEICA", mark: "LEICA" },
  { id: "sony", name: "SONY", mark: "SONY" },
  { id: "dji", name: "DJI", mark: "DJI" },
  { id: "bose", name: "BOSE", mark: "BOSE" },
];
