import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

const SECTIONS = [
  { key: "bidding", icon: "gavel" },
  { key: "payments", icon: "account_balance_wallet" },
  { key: "shipping", icon: "local_shipping" },
] as const;

export default async function HelpPage() {
  const t = await getTranslations("helpPage");

  return (
    <div className="luxora-app min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.3em] text-[#f0c982]">
          {t("badge")}
        </p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
          {t("description")}
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {SECTIONS.map((section) => (
            <section
              id={section.key}
              key={section.key}
              className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <span className="material-symbols-outlined text-3xl text-[#f0c982]">
                {section.icon}
              </span>
              <h2 className="mt-5 text-xl font-bold">{t(`${section.key}.title`)}</h2>
              <p className="mt-3 min-h-20 text-sm leading-6 text-white/55">
                {t(`${section.key}.description`)}
              </p>
              <Link
                href={t(`${section.key}.href`)}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#f0c982] hover:text-white"
              >
                {t("openFeature")}
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </section>
          ))}
        </div>

        <a
          href="mailto:support@bidzone.com"
          className="mt-10 inline-flex rounded-full border border-[#f0c982]/50 px-6 py-3 text-sm font-semibold text-[#f0c982] hover:bg-[#f0c982] hover:text-black"
        >
          {t("contactSupport")}
        </a>
      </main>
      <Footer />
    </div>
  );
}
