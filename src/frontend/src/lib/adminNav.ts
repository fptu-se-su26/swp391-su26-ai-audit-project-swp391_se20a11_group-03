import { ADMIN_HOME } from "@/lib/roleRouting";

export type AdminNavItem = {
  href: string;
  icon: string;
  label: string;
};

export type AdminNavGroup = {
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    title: "Vận hành",
    items: [
      { href: "/staff/approvals", icon: "task_alt", label: "Duyệt sản phẩm" },
      { href: "/staff/kyc-review", icon: "badge", label: "Duyệt KYC" },
      { href: "/staff/withdrawals", icon: "payments", label: "Duyệt rút tiền" },
    ],
  },
  {
    title: "Đấu giá",
    items: [
      { href: "/admin/auction-history", icon: "live_tv", label: "Tất cả phiên" },
      { href: "/admin/auction-history?payment=PAID", icon: "check_circle", label: "Đã thanh toán" },
      { href: "/admin/auction-history?payment=UNPAID", icon: "schedule", label: "Chưa thanh toán" },
      { href: "/admin/sales-history", icon: "receipt_long", label: "Lịch sử mua bán" },
    ],
  },
  {
    title: "Tài chính & pháp lý",
    items: [
      { href: "/admin/revenue", icon: "trending_up", label: "Thống kê doanh thu" },
      { href: "/admin/contracts", icon: "contract", label: "Hợp đồng điện tử" },
    ],
  },
  {
    title: "Quản trị hệ thống",
    items: [
      { href: "/admin/users", icon: "manage_accounts", label: "Người dùng & vai trò" },
      { href: "/admin/categories", icon: "category", label: "Danh mục" },
      { href: "/admin/bidding-rules", icon: "gavel", label: "Luật đấu giá" },
      { href: "/admin/audit-logs", icon: "fact_check", label: "Nhật ký hệ thống" },
    ],
  },
];

export const ADMIN_OVERVIEW_HREF = ADMIN_HOME;
