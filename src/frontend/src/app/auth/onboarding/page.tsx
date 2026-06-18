"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/i18n/I18nProvider";

export default function OnboardingPage() {
  const t = useTranslations("onboarding");
  const [selected, setSelected] = useState<"collector" | "seller" | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = () => {
    if (!selected) return;
    setLoading(true);
    setTimeout(() => {
      router.push(selected === "collector" ? "/dashboard" : "/inventory");
    }, 800);
  };

  const roles = [
    {
      id: "collector" as const,
      icon: "gavel",
      title: t("collectorTitle"),
      desc: t("collectorDesc"),
    },
    {
      id: "seller" as const,
      icon: "storefront",
      title: t("sellerTitle"),
      desc: t("sellerDesc"),
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col font-body-md overflow-x-hidden"
      style={{ backgroundColor: "#0a192f", color: "#ffffff" }}
    >
      {/* Atmospheric accents */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: -100, left: -100, width: 400, height: 400,
          background: "radial-gradient(circle, rgba(233,193,118,0.05) 0%, rgba(10,25,47,0) 70%)",
          borderRadius: "50%",
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: -100, right: -100, width: 400, height: 400,
          background: "radial-gradient(circle, rgba(233,193,118,0.05) 0%, rgba(10,25,47,0) 70%)",
          borderRadius: "50%",
        }}
      />

      {/* Header */}
      <header className="w-full flex justify-center pt-12 pb-8 relative z-10">
        <h1 className="font-headline-md text-headline-md font-extrabold tracking-tighter text-secondary-fixed">
          LuxeAuction
        </h1>
      </header>

      {/* Main */}
      <main className="flex-grow flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-lg text-center relative z-10">
        <div className="max-w-3xl mb-xl">
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-sm">
            {t("heroTitle")}
          </h2>
          <p className="font-headline-sm text-headline-sm text-on-primary-container opacity-80 max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter w-full max-w-5xl mb-xl">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`group flex flex-col items-center p-lg rounded-xl text-center focus:outline-none transition-all duration-300 ${
                selected === role.id
                  ? "border-secondary-fixed shadow-[0_0_40px_rgba(233,193,118,0.25)] scale-[1.02]"
                  : "hover:border-secondary-fixed-dim hover:shadow-[0_0_30px_rgba(233,193,118,0.15)] hover:-translate-y-2"
              }`}
              style={{
                background: selected === role.id
                  ? "rgba(233,193,118,0.05)"
                  : "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${selected === role.id ? "#ffdea5" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-secondary-fixed text-[40px]">{role.icon}</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-white mb-base">{role.title}</h3>
              <p className="font-body-md text-body-md text-on-primary-container opacity-70">{role.desc}</p>
              <div className={`mt-md transition-opacity ${selected === role.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                <span className="font-label-md text-label-md text-secondary-fixed uppercase tracking-widest">{t("selectAccount")}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="w-full max-w-md">
          <button
            onClick={handleContinue}
            disabled={!selected || loading}
            className="w-full py-md px-lg rounded-lg font-headline-sm text-headline-sm shadow-xl flex items-center justify-center gap-base transition-all"
            style={{
              background: selected ? "#ffdea5" : "#44474d",
              color: selected ? "#0d1c32" : "#75777e",
              opacity: selected ? 1 : 0.5,
              cursor: selected ? "pointer" : "not-allowed",
              boxShadow: selected ? "0 0 20px rgba(255,222,165,0.4)" : "none",
            }}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin">sync</span>
                {t("initializing")}
              </>
            ) : (
              <>
                {t("continueToDashboard")}
                <span className="material-symbols-outlined">arrow_forward</span>
              </>
            )}
          </button>
          <p className="mt-sm font-label-sm text-label-sm text-on-primary-container opacity-40">
            {t("encryptionNote")}
          </p>
        </div>
      </main>
    </div>
  );
}
