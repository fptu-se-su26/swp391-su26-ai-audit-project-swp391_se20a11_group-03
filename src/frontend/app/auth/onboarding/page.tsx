"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import BidZoneLogo from "@/components/brand/BidZoneLogo";
import LanguageSwitcher from "@/components/i18n/LanguageSwitcher";

type RoleId = "collector" | "seller";

const AUTH_COOKIE = "bidzone_role";

const ROLES: {
  id: RoleId;
  icon: string;
  href: string;
}[] = [
  {
    id: "collector",
    icon: "storefront",
    href: "/dashboard",
  },
  {
    id: "seller",
    icon: "sell",
    href: "/inventory",
  },
];

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [selected, setSelected] = useState<RoleId | null>(null);
  const [loading, setLoading] = useState(false);

  function handleContinue() {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      const role = ROLES.find((r) => r.id === selected);
      document.cookie = `${AUTH_COOKIE}=${selected}; path=/; max-age=604800; SameSite=Lax`;
      router.push(role?.href ?? "/dashboard");
    }, 500);
  }

  return (
    <div className="luxora-app flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-6 lg:px-12">
        <Link href="/" className="flex items-center" aria-label="BidZone">
          <BidZoneLogo className="h-11 w-auto" />
        </Link>
        <Link
          href="/auth"
          className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold hover:bg-white/5"
        >
          {tAuth("login")}
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-14 px-6 py-10 lg:grid-cols-2 lg:px-12">
        <div>
          <span className="text-xs font-semibold tracking-[0.35em] text-[var(--luxora-gold)]">
            {t("badge")}
          </span>
          <h1 className="font-display-lg mt-5 text-4xl leading-tight sm:text-5xl">
            {t("title")}
          </h1>

          <dl className="mt-10 grid grid-cols-3 gap-6">
            {[
              { value: "100%", label: t("stats.0") },
              { value: "24/7", label: t("stats.1") },
              { value: "72h", label: t("stats.2") },
            ].map((stat) => (
              <div key={stat.label}>
                <dd className="text-2xl font-bold text-[var(--luxora-gold-light)]">
                  {stat.value}
                </dd>
                <dt className="mt-1 text-xs text-white/50">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-5">
          {ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelected(role.id)}
              className={`flex items-start gap-4 rounded-2xl border p-6 text-left transition-colors ${
                selected === role.id
                  ? "border-[var(--luxora-gold)] bg-[var(--luxora-gold)]/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/25"
              }`}
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
                  selected === role.id
                    ? "border-[var(--luxora-gold)] text-[var(--luxora-gold)]"
                    : "border-white/20 text-white/60"
                }`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {role.icon}
                </span>
              </span>
              <div>
                <h3 className="font-headline-md text-lg">
                  {t(`roles.${role.id}.title`)}
                </h3>
                <p className="mt-1.5 text-sm text-white/50">
                  {t(`roles.${role.id}.description`)}
                </p>
              </div>
            </button>
          ))}

          <button
            type="button"
            disabled={!selected || loading}
            onClick={handleContinue}
            className="gradient-cta mt-2 rounded-full py-4 text-sm font-semibold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? t("processing") : t("continue")}
          </button>
        </div>
      </main>
    </div>
  );
}
