import { ADMIN_HOME } from "@/lib/roleRouting";

export type AdminNavItem = {
  href: string;
  icon: string;
  labelKey: string;
};

export type AdminNavGroup = {
  titleKey: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    titleKey: "groupOperations",
    items: [
      { href: "/staff/approvals", icon: "task_alt", labelKey: "approveProducts" },
      { href: "/staff/kyc-review", icon: "badge", labelKey: "approveKyc" },
      { href: "/staff/withdrawals", icon: "payments", labelKey: "approveWithdrawals" },
      { href: "/staff/support", icon: "support_agent", labelKey: "supportInbox" },
    ],
  },
  {
    titleKey: "groupAuctions",
    items: [
      { href: "/admin/auction-history", icon: "live_tv", labelKey: "allSessions" },
      { href: "/admin/auction-history?payment=PAID", icon: "check_circle", labelKey: "paidSessions" },
      { href: "/admin/auction-history?payment=UNPAID", icon: "schedule", labelKey: "unpaidSessions" },
      { href: "/admin/sales-history", icon: "receipt_long", labelKey: "salesHistory" },
      { href: "/admin/featured-products", icon: "star", labelKey: "featuredProducts" },
    ],
  },
  {
    titleKey: "groupFinance",
    items: [
      { href: "/admin/revenue", icon: "trending_up", labelKey: "revenueStats" },
      { href: "/admin/wallet-ledger", icon: "account_balance_wallet", labelKey: "walletLedger" },
      { href: "/admin/contracts", icon: "contract", labelKey: "contracts" },
    ],
  },
  {
    titleKey: "groupSystem",
    items: [
      { href: "/admin/users", icon: "manage_accounts", labelKey: "usersRoles" },
      { href: "/admin/categories", icon: "category", labelKey: "categories" },
      { href: "/admin/bidding-rules", icon: "gavel", labelKey: "biddingRules" },
      { href: "/admin/audit-logs", icon: "fact_check", labelKey: "auditLogs" },
    ],
  },
];

export const ADMIN_OVERVIEW_HREF = ADMIN_HOME;
