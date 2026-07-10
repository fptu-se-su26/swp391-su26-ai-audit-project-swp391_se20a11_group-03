"use client";

import AdminUseCasePage from "@/components/admin/AdminUseCasePage";
import { useTranslations } from "@/i18n/I18nProvider";

export default function BiddingRulesPage() {
  const t = useTranslations("adminBiddingRules");
  return (
    <AdminUseCasePage
      title={t("pageTitle")}
      subtitle={t("pageSubtitle")}
      sections={[
        {
          icon: "price_change",
          title: t("section1Title"),
          description: t("section1Desc"),
          status: t("section1Status"),
        },
        {
          icon: "account_balance_wallet",
          title: t("section2Title"),
          description: t("section2Desc"),
          status: t("section2Status"),
        },
        {
          icon: "timer",
          title: t("section3Title"),
          description: t("section3Desc"),
        },
        {
          icon: "verified_user",
          title: t("section4Title"),
          description: t("section4Desc"),
          status: t("section4Status"),
        },
      ]}
    />
  );
}
