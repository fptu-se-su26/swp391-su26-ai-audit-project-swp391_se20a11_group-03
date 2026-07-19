"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
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

const ACTIVE_BID_STATUSES = new Set(["leading", "outbid", "deposited", "sealed"]);

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const { data, loading, error } = useApiData(loadDashboard, EMPTY_DATA);
  const activeBids = data.bids.filter((bid) => ACTIVE_BID_STATUSES.has(bid.status));
  const leadingLot = activeBids[0];
  const totalSpent = data.wonItems
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.finalPrice, 0);

  function bidStatusLabel(status: string) {
    switch (status) {
      case "leading":
        return t("bidStatus.leading");
      case "won":
        return t("bidStatus.won");
      case "lost":
        return t("bidStatus.lost");
      case "outbid":
        return t("bidStatus.outbid");
      case "deposited":
        return t("bidStatus.deposited");
      case "sealed":
        return t("bidStatus.sealed");
      default:
        return status;
    }
  }

  function bidStatusClass(status: string) {
    if (status === "leading" || status === "won") {
      return "bg-green-500/10 text-green-300";
    }
    if (status === "lost" || status === "outbid") {
      return "bg-red-500/10 text-red-300";
    }
    return "bg-yellow-500/10 text-yellow-300";
  }

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
              {t("greeting", { name: data.account.profile.fullName || t("defaultName") })}
            </h1>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-2xl font-bold text-[var(--luxora-gold-light)]">
                  {activeBids.length}
                </p>
                <p className="text-xs text-white/50">{t("activeSessions")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--luxora-gold-light)]">
                  {data.wonItems.length}
                </p>
                <p className="text-xs text-white/50">{t("wonCount")}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--luxora-gold-light)]">
                  {totalSpent.toLocaleString("vi-VN")} ₫
                </p>
                <p className="text-xs text-white/50">{t("totalSpent")}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Priority session */}
            <div className="glass-panel rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {t("prioritySession")}
              </p>
              {leadingLot ? <div className="mt-4 flex items-center gap-4">
                <div
                  className="h-16 w-16 shrink-0 rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${toImageSrc(leadingLot.image)})` }}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{leadingLot.productName}</p>
                  <p className="text-xs text-white/40">
                    {leadingLot.lotNumber} · {t("timeLeft", { time: leadingLot.timeLeft })}
                  </p>
                </div>
                <Link
                  href={`/auctions/${leadingLot.auctionId}`}
                  className="gradient-cta rounded-full px-4 py-2 text-xs font-semibold text-black"
                >
                  {t("enterRoom")}
                </Link>
              </div> : <p className="mt-4 text-sm text-white/45">{loading ? t("loading") : error ?? t("noSessions")}</p>}
              {leadingLot?.status === "outbid" && (
                <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
                  {t("outbidWarning")}
                </p>
              )}
            </div>

            {/* Your lots */}
            <div>
              <h2 className="font-headline-md mb-4 text-lg">
                {t("yourLots")}
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
                        bidStatusClass(bid.status)
                      }`}
                    >
                      {bidStatusLabel(bid.status)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <div className="glass-panel rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                {t("walletTitle")}
              </p>
              <p className="mt-2 text-2xl font-bold text-[var(--luxora-gold-light)]">
                {data.account.wallet.availableBalance.toLocaleString("vi-VN")} ₫
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link
                  href="/wallet"
                  className="rounded-xl border border-white/10 py-2 text-center text-[11px] font-semibold hover:border-[var(--luxora-gold)]"
                >
                  {t("depositLink")}
                </Link>
                <Link
                  href="/wallet"
                  className="rounded-xl border border-white/10 py-2 text-center text-[11px] font-semibold hover:border-[var(--luxora-gold)]"
                >
                  {t("historyLink")}
                </Link>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                {t("shortcutsTitle")}
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
