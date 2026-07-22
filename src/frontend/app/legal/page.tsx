import { getTranslations } from "next-intl/server";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default async function LegalPage() {
  const t = await getTranslations("legalPage");

  return (
    <div className="luxora-app min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold tracking-[0.3em] text-[#f0c982]">
          {t("badge")}
        </p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
          {t("description")}
        </p>

        <div className="mt-10 space-y-6">
          <section id="terms" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#f0c982]">{t("termsTitle")}</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">{t("termsBody")}</p>
          </section>
          <section id="privacy" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#f0c982]">{t("privacyTitle")}</h2>
            <p className="mt-4 text-sm leading-7 text-white/65">{t("privacyBody")}</p>
          </section>
        </div>

        <a href="mailto:support@bidzone.com" className="mt-8 inline-flex text-sm font-semibold text-[#f0c982] hover:text-white">
          {t("contact")}
        </a>
      </main>
      <Footer />
    </div>
  );
}
