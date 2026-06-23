"use client";

import { useI18n } from "@/i18n/I18nProvider";

const copy = {
  vi: {
    nav: ["Đấu giá trực tiếp", "Sắp diễn ra", "Kết quả", "Bán sản phẩm"],
    search: "Tìm đồng hồ, nghệ thuật, đồ sưu tầm…",
    mobileSearch: "Tìm kiếm sản phẩm cao cấp…",
    badge: "Nhà đấu giá tuyển chọn toàn cầu",
    heroTitle: "Đấu giá trực tiếp những tuyệt tác xa xỉ quý hiếm.",
    heroDescription: "Khám phá đồng hồ, nghệ thuật, thiết kế và vật phẩm quý hiếm đã được xác thực từ những người bán uy tín trên toàn thế giới.",
    browse: "Xem phiên đang diễn ra",
    how: "Quy trình đấu giá",
    trust: ["Chuyên gia xác thực", "Bảo vệ người mua", "Thanh toán bảo mật"],
    stats: [["12K+", "Nhà sưu tầm"], ["98%", "Sản phẩm xác thực"], ["42", "Quốc gia tham gia"], ["24/7", "Đấu giá bảo mật"]],
    curated: "Tuyển chọn hôm nay", liveTitle: "Phiên đấu giá trực tiếp", liveDesc: "Những tuyệt tác được chuyên gia xác minh và đang mở đấu giá ngay lúc này.", explore: "Xem tất cả phiên trực tiếp",
    tabs: ["Tất cả", "Đồng hồ", "Nghệ thuật", "Trang sức", "Xe cổ", "Đồ sưu tầm"], price: "Khoảng giá", ending: "Sắp kết thúc", newly: "Mới đăng", highest: "Giá cao nhất",
    noLots: "Chưa có sản phẩm trong danh mục", noLotsDesc: "Hãy thử danh mục khác hoặc xem các phiên sắp diễn ra.",
    upcomingEyebrow: "Lên kế hoạch đặt giá", upcoming: "Phiên sắp diễn ra", calendar: "Xem lịch", resultsEyebrow: "Thông tin thị trường", results: "Kết quả gần đây", allResults: "Tất cả kết quả", soldFor: "Đã bán với giá",
    sellEyebrow: "Dịch vụ khách hàng riêng", sellTitle: "Một tuyệt tác xứng đáng với đúng người sở hữu.", sellDesc: "Nhận định giá miễn phí từ chuyên gia và tiếp cận mạng lưới nhà sưu tầm nghiêm túc trên toàn cầu.", valuation: "Bắt đầu định giá", specialists: "Gặp chuyên gia",
  },
  en: {
    nav: ["Live Auctions", "Upcoming", "Results", "Sell"], search: "Search watches, art, collectibles…", mobileSearch: "Search luxury lots…",
    badge: "The world’s curated auction house", heroTitle: "Bid on rare luxury collectibles in real time.", heroDescription: "Discover authenticated watches, art, design objects, and rare collectibles from trusted sellers worldwide.", browse: "Browse live lots", how: "How bidding works", trust: ["Expert authentication", "Buyer protection", "Secure payments"],
    stats: [["12K+", "Active collectors"], ["98%", "Verified lots"], ["42", "Countries represented"], ["24/7", "Secure bidding"]],
    curated: "Curated for today", liveTitle: "Live auctions", liveDesc: "Exceptional objects, verified by specialists and open for bidding now.", explore: "Explore all live lots", tabs: ["All lots", "Watches", "Art", "Jewelry", "Cars", "Collectibles"], price: "Price range", ending: "Ending soon", newly: "Newly listed", highest: "Highest bid", noLots: "No live lots in this category", noLotsDesc: "Try another category or explore upcoming auctions.",
    upcomingEyebrow: "Plan your next bid", upcoming: "Upcoming auctions", calendar: "View calendar", resultsEyebrow: "Market intelligence", results: "Recent results", allResults: "All results", soldFor: "Sold for", sellEyebrow: "Private client services", sellTitle: "A remarkable object deserves the right audience.", sellDesc: "Receive a complimentary valuation from our specialists and reach a global network of serious collectors.", valuation: "Start a valuation", specialists: "Meet our specialists",
  },
} as const;

export function useLuxuryHomeCopy() {
  const { locale } = useI18n();
  return copy[locale];
}
