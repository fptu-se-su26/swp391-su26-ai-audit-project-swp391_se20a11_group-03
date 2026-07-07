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

export type CategoryItem = {
  id: string;
  label: string;
  icon: string;
  count: string;
  description: string;
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
  { label: "TRANG CHỦ", href: "/" },
  { label: "SẢN PHẨM", href: "/storefront" },
  { label: "THƯƠNG HIỆU", href: "/brands" },
  { label: "VỀ CHÚNG TÔI", href: "/about" },
];

export const LIVE_AUCTION_ITEMS: LiveAuctionItem[] = [
  {
    id: "rolex-daytona",
    title: "Rolex Daytona",
    subtitle: "116500LN - 2023",
    currentPrice: "$28,750",
    estimatedPrice: "~ 712,500,000 VND",
    bidCount: 56,
    endsAt: Date.now() + (2 * 3600 + 45 * 60 + 16) * 1000,
    imageSrc: "/images/auction-products/rolex-daytona.png",
  },
  {
    id: "iphone-15-pro-max",
    title: "iPhone 15 Pro Max",
    subtitle: "1TB - Titanium Black",
    currentPrice: "$1,250",
    estimatedPrice: "~ 31,000,000 VND",
    bidCount: 27,
    endsAt: Date.now() + (1 * 3600 + 15 * 60 + 27) * 1000,
    imageSrc: "/images/auction-products/iphone-15-pro-max.png",
  },
  {
    id: "macbook-pro-m3-max",
    title: "MacBook Pro M3 Max",
    subtitle: "16 inch - 48GB - 1TB",
    currentPrice: "$3,250",
    estimatedPrice: "~ 80,500,000 VND",
    bidCount: 19,
    endsAt: Date.now() + (3 * 3600 + 35 * 60 + 48) * 1000,
    imageSrc: "/images/auction-products/macbook-pro-m3-max.png",
  },
  {
    id: "leica-m11",
    title: "Leica M11",
    subtitle: "Black Paint",
    currentPrice: "$8,900",
    estimatedPrice: "~ 220,000,000 VND",
    bidCount: 38,
    endsAt: Date.now() + (2 * 3600 + 10 * 60 + 38) * 1000,
    imageSrc: "/images/auction-products/leica-m11.png",
  },
  {
    id: "airpods-max",
    title: "AirPods Max",
    subtitle: "Space Gray",
    currentPrice: "$491",
    estimatedPrice: "~ 12,100,000 VND",
    bidCount: 41,
    endsAt: Date.now() + (1 * 3600 + 45 * 60 + 41) * 1000,
    imageSrc: "/images/auction-products/airpods-max.png",
  },
];

export const CATEGORY_ITEMS: CategoryItem[] = [
  {
    id: "dong-ho",
    label: "Đồng hồ",
    icon: "watch",
    count: "482",
    description: "Đồng hồ cơ, chronograph và dress watch được săn đón.",
    imageSrc: "/images/auction-products/rolex-daytona.png",
  },
  {
    id: "dien-thoai",
    label: "Điện thoại",
    icon: "smartphone",
    count: "318",
    description: "Flagship, bản màu hiếm và thiết bị còn nguyên hộp.",
    imageSrc: "/images/auction-products/iphone-15-pro-max.png",
  },
  {
    id: "laptop",
    label: "Laptop",
    icon: "laptop_mac",
    count: "126",
    description: "Laptop hiệu năng cao cho sưu tầm và sáng tạo.",
    imageSrc: "/images/auction-products/macbook-pro-m3-max.png",
  },
  {
    id: "may-anh",
    label: "Máy ảnh",
    icon: "photo_camera",
    count: "94",
    description: "Máy ảnh rangefinder, mirrorless và lens cao cấp.",
    imageSrc: "/images/auction-products/leica-m11.png",
  },
  {
    id: "tai-nghe",
    label: "Tai nghe",
    icon: "headphones",
    count: "210",
    description: "Tai nghe, loa, âm thanh cá nhân và phòng nghe.",
    imageSrc: "/images/auction-products/airpods-max.png",
  },
  {
    id: "tui-xach",
    label: "Túi xách",
    icon: "shopping_bag",
    count: "176",
    description: "Túi biểu tượng, bản vintage và phụ kiện luxury.",
    imageSrc: "/images/luxury-watch-hero.png",
  },
  {
    id: "do-dien-tu",
    label: "Đồ điện tử",
    icon: "devices",
    count: "260",
    description: "Thiết bị công nghệ, console và phụ kiện giới hạn.",
    imageSrc: "/images/auction-products/macbook-pro-m3-max.png",
  },
  {
    id: "trang-suc",
    label: "Trang sức",
    icon: "diamond",
    count: "155",
    description: "Trang sức, kim cương, phụ kiện quý và vật phẩm đeo.",
    imageSrc: "/images/luxury-watch-hero.png",
  },
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

export const HERO_STATS: TrustStat[] = [
  { id: "products", value: "10.000+", label: "Sản phẩm cao cấp" },
  { id: "members", value: "50.000+", label: "Thành viên toàn cầu" },
  { id: "success-rate", value: "98%", label: "Đấu giá thành công" },
  { id: "safe-payment", value: "100%", label: "Thanh toán an toàn" },
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
