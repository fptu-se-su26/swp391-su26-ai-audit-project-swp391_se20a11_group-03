"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

const AUDIENCE_BREAKDOWN = [
  { key: "all", value: 8420 },
  { key: "collectors", value: 6180 },
  { key: "sellers", value: 1840 },
  { key: "staff", value: 400 },
] as const;

const TYPE_CLASS: Record<string, string> = {
  event: "bg-blue-500/10 text-blue-300",
  compliance: "bg-yellow-500/10 text-yellow-300",
  system: "bg-white/10 text-white/50",
};

type SentBroadcast = { id: string; title: string; audience: string; type: string; sent: string };

export default function BroadcastsClient() {
  const t = useTranslations("adminBroadcastsPage");
  const locale = useLocale();
  const sentBroadcasts = t.raw("sentBroadcasts") as SentBroadcast[];
  const channels = t.raw("channels") as string[];
  const [sent, setSent] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-display-lg text-3xl">{t("title")}</h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form
          onSubmit={handleSend}
          className="glass-panel flex flex-col gap-4 rounded-2xl p-6 lg:col-span-2"
        >
          <p className="text-sm font-semibold">{t("compose")}</p>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">
              {t("subject")}
            </label>
            <input
              type="text"
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/50">
              {t("content")}
            </label>
            <textarea
              rows={4}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-white/50">
                {t("audience")}
              </label>
              <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]">
                {AUDIENCE_BREAKDOWN.map((a) => (
                  <option key={a.key} className="bg-[var(--luxora-bg-elevated)]">
                    {t(`audiences.${a.key}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-white/50">
                {t("channel")}
              </label>
              <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)]">
                {channels.map((v) => (
                  <option key={v} className="bg-[var(--luxora-bg-elevated)]">
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="gradient-cta mt-2 rounded-full py-3 text-sm font-semibold text-black"
          >
            {t("send")}
          </button>
          {sent && (
            <p className="rounded-xl bg-green-500/10 px-4 py-2.5 text-sm text-green-300">
              {t("success")}
            </p>
          )}
        </form>

        <div className="glass-panel rounded-2xl p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            {t("audienceBreakdown")}
          </p>
          <div className="flex flex-col gap-3">
            {AUDIENCE_BREAKDOWN.map((a) => (
              <div key={a.key} className="flex justify-between text-sm">
                <span className="text-white/50">{t(`audiences.${a.key}`)}</span>
                <span className="font-semibold">
                  {a.value.toLocaleString(locale)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <h2 className="font-headline-md mt-10 mb-4 text-lg">
        {t("sentTitle")}
      </h2>
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
              <th className="px-5 py-3 font-medium">{t("subject")}</th>
              <th className="px-5 py-3 font-medium">{t("audience")}</th>
              <th className="px-5 py-3 font-medium">{t("type")}</th>
              <th className="px-5 py-3 font-medium">{t("sentAt")}</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {sentBroadcasts.map((b) => (
              <tr key={b.id} className="border-b border-white/5">
                <td className="px-5 py-4 font-medium">{b.title}</td>
                <td className="px-5 py-4 text-white/60">{t(`audiences.${b.audience}`)}</td>
                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold ${TYPE_CLASS[b.type]}`}
                  >
                    {t(`types.${b.type}`)}
                  </span>
                </td>
                <td className="px-5 py-4 text-white/60">{b.sent}</td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold hover:border-[var(--luxora-gold)]"
                  >
                    {t("view")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
