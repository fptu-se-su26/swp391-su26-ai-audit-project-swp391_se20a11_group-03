import AdminShell from "@/components/layout/AdminShell";

const REPORTS = [
  { icon: "payments", title: "Revenue & Commission Report", desc: "Detailed breakdown of platform earnings, commissions, and payouts by period.", format: "CSV / PDF" },
  { icon: "gavel", title: "Auction Performance Report", desc: "Lot conversion rates, reserve met %, buyer-to-seller ratios, and average hammer price.", format: "CSV / PDF" },
  { icon: "group", title: "User Activity Report", desc: "Registration trends, KYC completion rates, active session counts, and churn analysis.", format: "CSV" },
  { icon: "verified_user", title: "Compliance & KYC Report", desc: "Identity verification completion rates, flagged accounts, and regulatory audit trail.", format: "PDF" },
  { icon: "receipt_long", title: "Transaction Ledger", desc: "Complete ledger of all deposits, bid locks, refunds, and withdrawals.", format: "CSV" },
  { icon: "flag", title: "Dispute & Resolution Report", desc: "Active disputes, median resolution time, and arbitration outcomes.", format: "PDF" },
];

const DATE_PRESETS = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "This Year", "Custom Range"];

export default function ReportsPage() {
  return (
    <AdminShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">Data Reports & Export</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">Generate and download comprehensive platform reports for analysis and compliance.</p>
        </div>

        {/* Date Range */}
        <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant flex flex-wrap items-center gap-sm">
          <span className="font-label-md text-label-md text-on-surface-variant mr-sm">Period:</span>
          {DATE_PRESETS.map((p) => (
            <button
              key={p}
              className={`px-md py-sm rounded-lg font-label-sm text-label-sm transition-colors ${
                p === "Last 30 Days"
                  ? "bg-secondary text-on-secondary glow-accent"
                  : "border border-outline-variant text-on-surface hover:bg-surface-container-low"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
          {REPORTS.map((report) => (
            <div key={report.title} className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant flex flex-col gap-md">
              <div className="flex items-start gap-md">
                <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px] text-primary">{report.icon}</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">{report.title}</h3>
                  <p className="font-body-md text-sm text-on-surface-variant mt-xs">{report.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-md border-t border-surface-variant">
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Formats: <span className="text-secondary font-medium">{report.format}</span>
                </span>
                <div className="flex gap-sm">
                  <button className="flex items-center gap-xs px-md py-sm rounded-lg bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-secondary-fixed-dim transition-colors glow-accent">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Export
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scheduled Reports */}
        <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant">
          <h2 className="font-headline-sm text-headline-sm text-primary mb-md border-b border-surface-variant pb-sm">Scheduled Reports</h2>
          <div className="space-y-md">
            {[
              { name: "Weekly Revenue Summary", freq: "Every Monday 08:00 AM", dest: "admin@luxeauction.com", active: true },
              { name: "Monthly Compliance Audit", freq: "1st of each month", dest: "compliance@luxeauction.com", active: true },
              { name: "Daily Transaction Ledger", freq: "Every day at midnight", dest: "finance@luxeauction.com", active: false },
            ].map((r) => (
              <div key={r.name} className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-surface-variant">
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{r.name}</p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant">{r.freq} · {r.dest}</p>
                </div>
                <div className="flex items-center gap-sm">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${r.active ? "bg-tertiary-fixed text-on-tertiary-fixed-variant" : "bg-surface-variant text-on-surface-variant"}`}>
                    {r.active ? "Active" : "Paused"}
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
