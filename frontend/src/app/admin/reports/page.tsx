"use client";

import AdminShell from "@/components/layout/AdminShell";
import { useTranslations } from "@/i18n/I18nProvider";

const REPORTS = [
  { icon: "payments", titleKey: "reportRevenue", descKey: "reportRevenueDesc", format: "CSV / PDF" },
  { icon: "gavel", titleKey: "reportAuction", descKey: "reportAuctionDesc", format: "CSV / PDF" },
  { icon: "group", titleKey: "reportUser", descKey: "reportUserDesc", format: "CSV" },
  { icon: "verified_user", titleKey: "reportCompliance", descKey: "reportComplianceDesc", format: "PDF" },
  { icon: "receipt_long", titleKey: "reportLedger", descKey: "reportLedgerDesc", format: "CSV" },
  { icon: "flag", titleKey: "reportDispute", descKey: "reportDisputeDesc", format: "PDF" },
];

const DATE_PRESETS_KEYS = ["last7Days", "last30Days", "last90Days", "thisYear", "customRange"];

const SCHEDULED_REPORTS = [
  { nameKey: "schedReportWeeklyRevenue", freq: "Every Monday 08:00 AM", dest: "admin@luxeauction.com", active: true },
  { nameKey: "schedReportMonthlyCompliance", freq: "1st of each month", dest: "compliance@luxeauction.com", active: true },
  { nameKey: "schedReportDailyLedger", freq: "Every day at midnight", dest: "finance@luxeauction.com", active: false },
];

export default function ReportsPage() {
  const t = useTranslations("adminReports");
  return (
    <AdminShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("pageTitle")}</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">{t("pageSubtitle")}</p>
        </div>

        {/* Date Range */}
        <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant flex flex-wrap items-center gap-sm">
          <span className="font-label-md text-label-md text-on-surface-variant mr-sm">{t("period")}</span>
          {DATE_PRESETS_KEYS.map((key) => (
            <button
              key={key}
              className={`px-md py-sm rounded-lg font-label-sm text-label-sm transition-colors ${
                key === "last30Days"
                  ? "bg-secondary text-on-secondary glow-accent"
                  : "border border-outline-variant text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
          {REPORTS.map((report) => (
            <div key={report.titleKey} className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant flex flex-col gap-md">
              <div className="flex items-start gap-md">
                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px] text-primary">{report.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">{t(report.titleKey)}</h3>
                  <p className="font-body-md text-sm text-on-surface-variant mt-xs">{t(report.descKey)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-md border-t border-surface-variant">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  {t("formats")} <span className="text-secondary font-medium">{report.format}</span>
                </span>
                <div className="flex gap-sm">
                  <button className="flex items-center gap-xs px-md py-sm rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-secondary-fixed-dim transition-colors glow-accent">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    {t("export")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scheduled Reports */}
        <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-md border-b border-surface-variant pb-sm">{t("scheduledReports")}</h2>
          <div className="space-y-md">
            {SCHEDULED_REPORTS.map((r) => (
              <div key={r.nameKey} className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-surface-variant">
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{t(r.nameKey)}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{r.freq} · {r.dest}</p>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${r.active ? "bg-tertiary-fixed text-on-tertiary-fixed-variant" : "bg-surface-variant text-on-surface-variant"}`}>
                    {r.active ? t("active") : t("paused")}
                  </span>
                  <button className="material-symbols-outlined text-outline hover:text-primary transition-colors text-[20px]">more_vert</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
