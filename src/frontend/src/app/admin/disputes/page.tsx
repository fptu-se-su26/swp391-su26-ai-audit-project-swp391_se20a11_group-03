"use client";

import AdminUseCasePage from "@/components/admin/AdminUseCasePage";
import { useTranslations } from "@/i18n/I18nProvider";

export default function DisputesPage() {
  const t = useTranslations("adminDisputes");
  return (
    <AdminUseCasePage
      title={t("pageTitle")}
      subtitle={t("pageSubtitle")}
      sections={[
        {
          icon: "support_agent",
          title: t("section1Title"),
          description: t("section1Desc"),
          status: t("section1Status"),
        },
        {
          icon: "image_search",
          title: t("section2Title"),
          description: t("section2Desc"),
        },
        {
          icon: "balance",
          title: t("section3Title"),
          description: t("section3Desc"),
        },
        {
          icon: "history",
          title: t("section4Title"),
          description: t("section4Desc"),
        },
      ]}
    />
  );
}
