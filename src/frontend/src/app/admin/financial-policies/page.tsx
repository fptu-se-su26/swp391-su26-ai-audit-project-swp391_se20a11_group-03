"use client";

import AdminUseCasePage from "@/components/admin/AdminUseCasePage";
import { useTranslations } from "@/i18n/I18nProvider";

export default function FinancialPoliciesPage() {
  const t = useTranslations("adminFinancialPolicies");
  return (
    <AdminUseCasePage
      title={t("pageTitle")}
      subtitle={t("pageSubtitle")}
      sections={[
        {
          icon: "percent",
          title: t("section1Title"),
          description: t("section1Desc"),
        },
        {
          icon: "receipt_long",
          title: t("section2Title"),
          description: t("section2Desc"),
        },
        {
          icon: "savings",
          title: t("section3Title"),
          description: t("section3Desc"),
        },
        {
          icon: "account_balance",
          title: t("section4Title"),
          description: t("section4Desc"),
        },
      ]}
    />
  );
}
