"use client";

import { useState } from "react";
import AdminShell from "@/components/layout/AdminShell";
import { useTranslations } from "@/i18n/I18nProvider";

const TYPE_BADGE: Record<string, string> = {
  Event: "bg-secondary-container text-on-secondary-container",
  Compliance: "bg-primary-fixed text-on-primary-fixed-variant",
  System: "bg-surface-container-high text-on-surface",
};

export default function BroadcastsPage() {
  const t = useTranslations("adminBroadcasts");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState(t("allUsers"));
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      setError(t("fillBothFields"));
      return;
    }

    setError(null);
    setSent(true);
    setTitle("");
    setBody("");

    setTimeout(() => setSent(false), 3000);
  };

  return (
    <AdminShell>
      <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
        <div>
          <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("pageTitle")}</h1>
          <p className="font-body-lg text-on-surface-variant mt-xs">
            {t("pageSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
          {/* Compose */}
          <div className="xl:col-span-2 bg-surface rounded-xl p-lg soft-shadow border border-surface-variant space-y-md">
            <h2 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-sm">
              {t("composeTitle")}
            </h2>

            {sent && (
              <div className="p-md bg-tertiary-fixed/20 border border-tertiary-fixed-dim/30 rounded-lg flex items-center gap-sm">
                <span
                  className="material-symbols-outlined text-on-tertiary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="font-label-md text-on-tertiary-container">{t("broadcastSent")}</span>
              </div>
            )}

            {error && (
              <div className="p-md bg-error-container border border-error/30 rounded-lg flex items-center gap-sm">
                <span className="material-symbols-outlined text-on-error-container">error</span>
                <span className="font-label-md text-on-error-container">{error}</span>
              </div>
            )}

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">{t("titleLabel")}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">{t("messageLabel")}</label>
              <textarea
                rows={6}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t("messagePlaceholder")}
                className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none resize-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">{t("audienceLabel")}</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low outline-none focus:border-secondary appearance-none"
                >
                  <option>{t("allUsers")}</option>
                  <option>{t("collectorsOnly")}</option>
                  <option>{t("sellersOnly")}</option>
                  <option>{t("staffOnly")}</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">{t("sendViaLabel")}</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low outline-none focus:border-secondary appearance-none">
                  <option>{t("inAppNotification")}</option>
                  <option>{t("emailAndInApp")}</option>
                  <option>{t("emailOnly")}</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSend}
              className="w-full bg-secondary text-on-secondary py-md rounded-xl font-headline-sm glow-accent hover:bg-secondary-fixed-dim transition-all flex items-center justify-center gap-sm"
            >
              <span className="material-symbols-outlined">campaign</span>
              {t("sendBroadcast")}
            </button>
          </div>

          {/* Audience Stats */}
          <div className="space-y-md">
            <div className="bg-surface rounded-xl p-md soft-shadow border border-surface-variant">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-md">{t("audienceBreakdown")}</h3>
              <p className="text-sm text-on-surface-variant text-center py-md">
                {t("connectDbHint")}
              </p>
            </div>
          </div>
        </div>

        {/* Sent Broadcasts */}
        <section>
          <h2 className="font-headline-sm text-headline-sm text-primary border-b border-surface-variant pb-xs mb-md">
            {t("sentBroadcasts")}
          </h2>
          <div className="bg-surface rounded-xl soft-shadow border border-surface-variant overflow-hidden">
            <div className="p-lg text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-md">inbox</span>
              <p className="text-on-surface-variant">{t("noBroadcasts")}</p>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
