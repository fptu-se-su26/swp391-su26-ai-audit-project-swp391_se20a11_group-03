"use client";

import AdminUseCasePage from "@/components/admin/AdminUseCasePage";
import { useTranslations } from "@/i18n/I18nProvider";

export default function NotificationsPage() {
  const t = useTranslations("adminNotifications");
  return (
    <AdminUseCasePage
      title={t("pageTitle")}
      subtitle={t("pageSubtitle")}
      sections={[
        {
          icon: "campaign",
          title: t("section1Title"),
          description: t("section1Desc"),
          status: t("section1Status"),
        },
        {
          icon: "notifications_active",
          title: t("section2Title"),
          description: t("section2Desc"),
        },
        {
          icon: "mark_email_read",
          title: t("section3Title"),
          description: t("section3Desc"),
        },
        {
          icon: "archive",
          title: t("section4Title"),
          description: t("section4Desc"),
        },
      ]}
    />
  );
}
