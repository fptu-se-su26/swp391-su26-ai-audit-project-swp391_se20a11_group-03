"use client";

import Link from "next/link";
import CollectorShell from "@/components/shells/CollectorShell";
import { auctionApi, fetchAccountSummary, toImageSrc, type AccountSummary, type UserBid, type WonAuction } from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";

type DashboardData = { account: AccountSummary; bids: UserBid[]; wonItems: WonAuction[] };

async function loadDashboard(): Promise<DashboardData> {
  const [account, bids, wonItems] = await Promise.all([
    fetchAccountSummary(),
    auctionApi.myBids(),
    auctionApi.wonAuctions(),
  ]);
  return { account, bids: bids.data, wonItems: wonItems.data };
}

const EMPTY_DATA: DashboardData = {
  account: {
    profile: { userId: 0, fullName: "", email: "", phone: "", identityNumber: null, roleName: "", status: "", identityVerified: false, profileStatus: null, identityVerifiedAt: null, active: false, paymentStrikeCount: 0, lockedByPaymentStrikes: false },
    wallet: { walletId: 0, userId: 0, balance: 0, holdBalance: 0, availableBalance: 0, status: "" },
  },
  bids: [],
  wonItems: [],
};

export default function DashboardPage() {
  const { data, loading, error } = useApiData(loadDashboard, EMPTY_DATA);
  const leadingLot = data.bids[0];
  const totalSpent = data.wonItems
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.finalPrice, 0);

  return (
    <CollectorShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Hero */}
        <section className="glass-card relative overflow-hidden rounded-3xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30"
            style={{ backgroundImage: leadingLot ? `url(${toImageSrc(leadingLot.image)})` : undefined }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--luxora-bg)] via-[var(--luxora-bg)]/60 to-transparent" />
          <div className="relative z-10 flex flex-col gap-6 p-10">
            <h1 className="font-display-lg text-3xl">
              Xin chào, {data.account.profile.fullName || "bạn"}
            </h1>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-2xl font-bold text-[var(--luxora-gold-light)]">
                  {data.bids.length}
                </p>
                <p className="text-xs text-white/50">Phiên đang tham gia</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--luxora-gold-light)]">
                  {data.wonItems.length}
                </p>
                <p className="text-xs text-white/50">Đã thắng</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--luxora-gold-light)]">
                  {totalSpent.toLocaleString("vi-VN")} ₫
                </p>
                <p className="text-xs text-white/50">Tổng chi tiêu</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Aside: phiên ưu tiên */}
            <div className="glass-panel rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Phiên ưu tiên
              </p>
              {leadingLot ? <div className="mt-4 flex items-center gap-4">
                <div
                  className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${toImageSrc(leadingLot.image)})` }}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{leadingLot.productName}</p>
                  <p className="text-xs text-white/40">
                    {leadingLot.lotNumber} · Còn {leadingLot.timeLeft}
                  </p>
                </div>
                <Link
                  href={`/auctions/${leadingLot.auctionId}`}
                  className="gradient-cta rounded-full px-4 py-2 text-xs font-semibold text-black"
                >
                  Vào phòng đấu
                </Link>
              </div> : <p className="mt-4 text-sm text-white/45">{loading ? "Đang tải dữ liệu..." : error ?? "Bạn chưa tham gia phiên đấu giá nào."}</p>}
              {leadingLot?.status === "outbid" && (
                <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  Bạn đã bị vượt giá cho lot này.
                </p>
              )}
            </div>

            {/* Các lot của bạn */}
            <div>
              <h2 className="font-headline-md mb-4 text-lg">
                Các lot của bạn
              </h2>
              <div className="flex flex-col gap-3">
                {data.bids.map((bid) => (
                  <Link
                    key={bid.bidId}
                    href={`/auctions/${bid.auctionId}`}
                    className="glass-card flex items-center gap-4 rounded-2xl p-4"
                  >
                    <div
                      className="h-14 w-14 shrink-0 rounded-xl bg-cover bg-center"
                      style={{ backgroundImage: `url(${toImageSrc(bid.image)})` }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{bid.productName}</p>
                      <p className="text-xs text-white/40">
                        {bid.lotNumber} · {bid.currentBid.toLocaleString("vi-VN")} ₫
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                        bid.status === "leading" || bid.status === "won"
                          ? "bg-green-500/10 text-green-300"
                          : "bg-red-500/10 text-red-300"
                      }`}
                    >
                      {bid.status === "leading" || bid.status === "won" ? "Đang dẫn đầu" : bid.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Cột phải */}
          <div className="flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Ví BidZone
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">
                {data.account.wallet.availableBalance.toLocaleString("vi-VN")} ₫
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/wallet"
                  className="rounded-xl border border-white/10 py-2 text-center text-[11px] font-semibold hover:border-[var(--luxora-gold)]"
                >
                  Nạp tiền
                </Link>
                <Link
                  href="/wallet"
                  className="rounded-xl border border-white/10 py-2 text-center text-[11px] font-semibold hover:border-[var(--luxora-gold)]"
                >
                  Lịch sử giao dịch
                </Link>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                Lối tắt
              </p>
              <div className="flex flex-col gap-1">
                {[
                  { label: "Watchlist", href: "/watchlist", icon: "visibility" },
                  { label: "KYC", href: "/kyc", icon: "verified_user" },
                  { label: "Messages", href: "/messages", icon: "chat" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CollectorShell>
  );
}
