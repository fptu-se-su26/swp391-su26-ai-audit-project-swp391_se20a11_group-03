import AdminShell from "@/components/shells/AdminShell";
import { getTranslations } from "next-intl/server";

type ReportTile = { title: string; icon: string };
type ScheduledReport = { title: string; cadence: string; active: boolean };

export default async function AdminReportsPage() {
  const t = await getTranslations("adminReports");
  const datePresets = t.raw("datePresets") as string[];
  const reports = t.raw("reports") as ReportTile[];
  const scheduledReports = t.raw("scheduledReports") as ScheduledReport[];

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-display-lg text-3xl">{t("title")}</h1>

        <div className="mt-6 flex flex-wrap gap-2">
          {datePresets.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`rounded-full px-4 py-2 text-xs font-semibold ${
                preset === t("activePreset")
                  ? "bg-[var(--luxora-gold)] text-black"
                  : "border border-white/10 text-white/60 hover:border-[var(--luxora-gold)]"
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => (
            <div key={r.title} className="glass-card rounded-2xl p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold)]">
                <span className="material-symbols-outlined">{r.icon}</span>
              </span>
              <p className="mt-4 font-semibold">{r.title}</p>
              <button
                type="button"
                className="mt-4 w-full rounded-full border border-white/15 py-2 text-xs font-semibold hover:border-[var(--luxora-gold)]"
              >
                {t("export")}
              </button>
            </div>
          ))}
        </div>

        <h2 className="font-headline-md mt-10 mb-4 text-lg">
          {t("scheduledTitle")}
        </h2>
        <div className="flex flex-col gap-3">
          {scheduledReports.map((r) => (
            <div
              key={r.title}
              className="glass-panel flex items-center justify-between rounded-2xl p-5"
            >
              <div>
                <p className="text-sm font-semibold">{r.title}</p>
                <p className="text-xs text-white/40">{r.cadence}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                  r.active
                    ? "bg-green-500/10 text-green-300"
                    : "bg-white/10 text-white/40"
                }`}
              >
                {r.active ? t("running") : t("paused")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
