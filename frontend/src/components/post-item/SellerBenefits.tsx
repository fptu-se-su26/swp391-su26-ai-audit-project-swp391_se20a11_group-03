"use client";

import { useMemo } from "react";
import { useTranslations } from "@/i18n/I18nProvider";

export default function SellerBenefits() {
  const t = useTranslations("sellerAccess");

  const benefits = useMemo(
    () => [
      ["workspace_premium", t("benefit1Title"), t("benefit1Desc")],
      ["shield_lock", t("benefit2Title"), t("benefit2Desc")],
      ["public", t("benefit3Title"), t("benefit3Desc")],
    ],
    [t],
  );

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {benefits.map(([icon, title, description]) => (
        <div key={title} className="rounded-2xl border border-[#e1dbcf] bg-white/75 p-4 shadow-[0_8px_25px_rgba(18,31,44,.04)] backdrop-blur transition hover:-translate-y-0.5 hover:border-[#c7a85b]">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2ead7] text-[#927026]">
            <span className="material-symbols-outlined text-[19px]">{icon}</span>
          </span>
          <h3 className="mt-3 text-xs font-bold text-[#102235]">{title}</h3>
          <p className="mt-1 text-[11px] leading-5 text-[#737c84]">{description}</p>
        </div>
      ))}
    </div>
  );
}
