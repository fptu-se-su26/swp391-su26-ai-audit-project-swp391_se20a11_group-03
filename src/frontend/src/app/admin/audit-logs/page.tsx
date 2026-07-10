"use client";

import AdminUseCasePage from "@/components/admin/AdminUseCasePage";
import { useTranslations } from "@/i18n/I18nProvider";

export default function AuditLogsPage() {
  const t = useTranslations("adminAuditLogs");
  return (
    <AdminUseCasePage
      title={t("pageTitle")}
      subtitle={t("pageSubtitle")}
      sections={[
        {
          icon: "security",
          title: t("section1Title"),
          description: t("section1Desc"),
        },
        {
          icon: "admin_panel_settings",
          title: t("section2Title"),
          description: t("section2Desc"),
        },
        {
          icon: "gavel",
          title: t("section3Title"),
          description: t("section3Desc"),
        },
        {
          icon: "webhook",
          title: t("section4Title"),
          description: t("section4Desc"),
        },
      ]}
    />
  );
}
