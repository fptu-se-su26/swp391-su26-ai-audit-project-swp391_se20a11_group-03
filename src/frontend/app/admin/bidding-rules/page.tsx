import AdminShell from "@/components/shells/AdminShell";
import { getTranslations } from "next-intl/server";

/**
 * Read-only view of the auction rules currently enforced by the backend
 * (BiddingService / StepCalculator / DepositCalculator / settlement).
 * Keep this page in sync when the backend rules change.
 */
type RuleSection = {
  title: string;
  icon: string;
  rules: string[];
};

export default async function AdminBiddingRulesPage() {
  const t = await getTranslations("adminBiddingRules");
  const sections = t.raw("sections") as RuleSection[];

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
          {t("badge")}
        </p>
        <h1 className="font-display-lg mt-2 text-3xl">{t("title")}</h1>
        <p className="mt-2 text-sm text-white/50">
          {t("subtitle")}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title} className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[var(--luxora-gold-light)]">
                  {section.icon}
                </span>
                <h2 className="text-sm font-semibold">{section.title}</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {section.rules.map((rule) => (
                  <li key={rule} className="flex gap-2 text-xs leading-5 text-white/60">
                    <span className="text-[var(--luxora-gold)]">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
