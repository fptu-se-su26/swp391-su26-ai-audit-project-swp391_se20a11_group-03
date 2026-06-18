"use client";

import { useCallback, useEffect, useState } from "react";
import StaffShell from "@/components/layout/StaffShell";
import {
  KycStatus,
  KycSubmission,
  approveKyc,
  listKycSubmissions,
  rejectKyc,
  requestKycInfo,
} from "@/lib/services/kycService";
import { API_BASE_URL } from "@/lib/apiClient";
import { useTranslations } from "@/i18n/I18nProvider";

function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

const STATUS_CFG: Record<KycStatus, { labelKey: string; class: string }> = {
  PENDING: { labelKey: "statusPending", class: "bg-secondary-container text-on-secondary-container" },
  APPROVED: { labelKey: "statusApproved", class: "bg-tertiary-fixed text-on-tertiary-fixed-variant" },
  REJECTED: { labelKey: "statusRejected", class: "bg-error-container text-on-error-container" },
  INFO_REQUIRED: { labelKey: "statusInfoRequired", class: "bg-primary-fixed text-on-primary-fixed-variant" },
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function KYCReviewPage() {
  const t = useTranslations("staffKyc");
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [busyAction, setBusyAction] = useState<"approve" | "reject" | "info" | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<KycStatus | "ALL">("PENDING");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const list = await listKycSubmissions(statusFilter === "ALL" ? undefined : statusFilter);
      setSubmissions(list ?? []);
      if ((list ?? []).length > 0 && selectedId == null) {
        setSelectedId(list[0].kycId);
      }
    } catch (error) {
      setSubmissions([]);
      setErrorMessage(t("loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, selectedId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const active = submissions.find((s) => s.kycId === selectedId) ?? null;

  const handleDecision = async (action: "approve" | "reject" | "info") => {
    if (!active) return;
    if ((action === "reject" || action === "info") && notes.trim().length === 0) {
      setFeedback({ tone: "error", message: t("noteRequired") });
      return;
    }
    setBusyAction(action);
    setFeedback(null);
    try {
      let result;
      if (action === "approve") {
        result = await approveKyc(active.kycId);
      } else if (action === "reject") {
        result = await rejectKyc(active.kycId, notes.trim());
      } else {
        result = await requestKycInfo(active.kycId, notes.trim());
      }
      if (result.success) {
        setFeedback({
          tone: "success",
          message:
            action === "approve"
              ? t("successApproved")
              : action === "reject"
                ? t("successRejected")
                : t("successInfoRequired"),
        });
        setNotes("");
        await refresh();
      } else {
        setFeedback({ tone: "error", message: result.message || "Action failed." });
      }
    } catch (error) {
      setFeedback({ tone: "error", message: error instanceof Error ? error.message : "Action failed." });
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <StaffShell>
      <div className="flex h-full">
        <aside className="flex h-full w-80 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low">
          <div className="border-b border-outline-variant p-md">
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary">{t("queueTitle")}</h2>
            <p className="mt-xs font-label-sm text-label-sm text-on-surface-variant">
              {t("queueSubmissions", { count: String(submissions.length) })}
            </p>
            <div className="mt-sm flex flex-wrap gap-xs">
              {(["PENDING", "APPROVED", "REJECTED", "INFO_REQUIRED", "ALL"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                    statusFilter === value
                      ? "bg-secondary text-on-secondary"
                      : "border border-outline-variant text-on-surface-variant hover:border-secondary"
                  }`}
                >
                  {value === "ALL" ? t("filterAll") : t(STATUS_CFG[value as KycStatus].labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center p-md">
                <span className="material-symbols-outlined animate-spin text-2xl text-primary">progress_activity</span>
              </div>
            ) : errorMessage ? (
              <div className="p-md text-sm text-error">{errorMessage}</div>
            ) : submissions.length === 0 ? (
              <div className="p-md text-center text-on-surface-variant">
                <span className="material-symbols-outlined mb-sm text-4xl">inbox</span>
                <p className="text-sm">{t("noSubmissions")}</p>
              </div>
            ) : (
              submissions.map((sub) => {
                const cfg = STATUS_CFG[sub.status] ?? STATUS_CFG.PENDING;
                return (
                  <button
                    key={sub.kycId}
                    onClick={() => setSelectedId(sub.kycId)}
                    className={`w-full border-b border-outline-variant/30 p-md text-left transition-colors hover:bg-surface-container-high ${
                      selectedId === sub.kycId ? "border-r-2 border-r-secondary bg-surface-container-high" : ""
                    }`}
                  >
                    <div className="mb-xs flex items-start justify-between gap-xs">
                      <span className="font-label-md text-primary">{sub.fullName}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${cfg.class}`}>
                        {t(cfg.labelKey)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-on-surface-variant">{sub.email}</p>
                    <p className="mt-1 text-[11px] text-on-surface-variant">
                      {t("submitted")} {sub.submittedAt ? dateFormatter.format(new Date(sub.submittedAt)) : "—"}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex-1 space-y-lg overflow-y-auto bg-background p-margin-mobile md:p-margin-desktop">
          {active ? (
            <>
              <div className="flex items-start justify-between gap-sm">
                <div>
                  <h1 className="font-display-lg-mobile text-primary md:font-headline-md">{t("pageTitle")} — {active.fullName}</h1>
                  <p className="mt-xs font-label-md text-label-md text-on-surface-variant">
                    {active.email} · {active.phone} · {t("submitted")}{" "}
                    {active.submittedAt ? dateFormatter.format(new Date(active.submittedAt)) : "—"}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                    (STATUS_CFG[active.status] ?? STATUS_CFG.PENDING).class
                  }`}
                >
                  {t((STATUS_CFG[active.status] ?? STATUS_CFG.PENDING).labelKey)}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-md md:grid-cols-2">
                <InfoRow label={t("fullName")} value={active.fullName} />
                <InfoRow label={t("phone")} value={active.phone} />
                <InfoRow label={t("idNumber")} value={active.cccdNumber} />
                <InfoRow label={t("dob")} value={active.dob} />
                <InfoRow label={t("gender")} value={active.gender} />
                <InfoRow label={`${t("issueDate")} / ${t("issuePlace")}`} value={`${active.issueDate} · ${active.issuePlace}`} />
              </div>

              <div className="grid grid-cols-1 gap-md md:grid-cols-3">
                <PhotoPreview title={t("front")} src={resolveImageUrl(active.frontImageUrl)} analysis={active.frontImageAnalysis} />
                <PhotoPreview title={t("back")} src={resolveImageUrl(active.backImageUrl)} analysis={active.backImageAnalysis} />
                <PhotoPreview title={t("selfie")} src={resolveImageUrl(active.selfieImageUrl)} analysis={active.selfieImageAnalysis} />
              </div>

              {active.rejectionReason && (
                <div className="rounded-lg border border-error/40 bg-error-container/40 px-md py-sm text-on-error-container">
                  <p className="font-label-md text-label-md">{t("previousNote")}</p>
                  <p className="mt-xs font-body-md text-body-md">{active.rejectionReason}</p>
                </div>
              )}

              <div className="rounded-xl border border-surface-variant bg-surface p-md soft-shadow">
                <h3 className="mb-sm font-headline-sm text-headline-sm text-primary">{t("reviewNote")}</h3>
                <p className="mb-sm text-sm text-on-surface-variant">
                  {t("reviewNoteHint")}
                </p>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder={t("reviewNotePlaceholder")}
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>

              {feedback && (
                <div
                  className={`rounded-lg border px-4 py-3 font-body-md text-body-md ${
                    feedback.tone === "success"
                      ? "border-tertiary/40 bg-tertiary-container text-on-tertiary-container"
                      : "border-error/40 bg-error-container text-error"
                  }`}
                >
                  {feedback.message}
                </div>
              )}

              <div className="flex flex-wrap gap-sm">
                <button
                  type="button"
                  onClick={() => handleDecision("approve")}
                  disabled={busyAction !== null}
                  className="flex flex-1 items-center justify-center gap-xs rounded-xl bg-tertiary-fixed px-lg py-md font-headline-sm text-headline-sm text-on-tertiary-fixed-variant transition-opacity hover:opacity-90 disabled:opacity-50 md:flex-none"
                >
                  <span className="material-symbols-outlined">check_circle</span>
                  {busyAction === "approve" ? t("approving") : t("approve")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision("info")}
                  disabled={busyAction !== null}
                  className="flex flex-1 items-center justify-center gap-xs rounded-xl border border-secondary px-lg py-md font-headline-sm text-headline-sm text-secondary transition-colors hover:bg-secondary/10 disabled:opacity-50 md:flex-none"
                >
                  <span className="material-symbols-outlined">help</span>
                  {busyAction === "info" ? t("sending") : t("requestInfo")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDecision("reject")}
                  disabled={busyAction !== null}
                  className="flex flex-1 items-center justify-center gap-xs rounded-xl bg-error-container px-lg py-md font-headline-sm text-headline-sm text-on-error-container transition-opacity hover:opacity-90 disabled:opacity-50 md:flex-none"
                >
                  <span className="material-symbols-outlined">cancel</span>
                  {busyAction === "reject" ? t("rejecting") : t("reject")}
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <span className="material-symbols-outlined mb-md text-6xl text-on-surface-variant">person_search</span>
              <p className="text-lg text-on-surface-variant">{t("selectHint")}</p>
            </div>
          )}
        </section>
      </div>
    </StaffShell>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-lg border border-surface-variant bg-surface p-md">
      <p className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="mt-xs font-body-md text-body-md text-primary">{value ?? "—"}</p>
    </div>
  );
}

function PhotoPreview({
  title,
  src,
}: {
  title: string;
  src: string;
  analysis?: unknown;
}) {
  return (
    <div className="rounded-xl border border-surface-variant bg-surface p-md soft-shadow">
      <h3 className="mb-sm font-headline-sm text-headline-sm text-primary">{title}</h3>
      <div className="overflow-hidden rounded-md border border-outline-variant bg-surface-container-low">
        {src ? (
          <img src={src} alt={title} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">image_not_supported</span>
          </div>
        )}
      </div>
    </div>
  );
}
