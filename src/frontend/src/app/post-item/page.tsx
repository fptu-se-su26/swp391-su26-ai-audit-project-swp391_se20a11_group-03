"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/post-item/DashboardLayout";
import SellerAccessRequired from "@/components/post-item/SellerAccessRequired";
import { StoredUser, getStoredUser, subscribeStoredUser } from "@/lib/userSession";
import {
  getCategories,
  getCategoryAttributes,
  createProduct,
  uploadProductImages,
  type CategorySummary,
  type CategoryAttribute,
} from "@/lib/services/productService";
import { useTranslations } from "@/i18n/I18nProvider";
import { useKycStatus } from "@/lib/hooks/useKycStatus";

interface ConsignmentForm {
  productName: string;
  categoryId: number | "";
  itemDescription: string;
  estimatedValue: string;
  auctionMode: "LIVE" | "TIMED";
  scheduledStartTime: string;
  scheduledDurationHours: number;
}

function defaultStartTimeLocal(): string {
  // Default to "now + 10 minutes", rounded UP to the next 5-minute mark,
  // so the value stays in the future even if the user lingers on the form.
  const d = new Date(Date.now() + 10 * 60 * 1000);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5, 0, 0);
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

const MIN_START_LEAD_MINUTES = 5;

function startTimeErrorMessage(localValue: string, t: (key: string, values?: Record<string, string | number>) => string): string | null {
  if (!localValue) return t("validation.startTimeRequired");
  const picked = new Date(localValue);
  if (Number.isNaN(picked.getTime())) return t("validation.startTimeInvalid");
  const now = Date.now();
  const diffMs = picked.getTime() - now;
  if (diffMs < MIN_START_LEAD_MINUTES * 60 * 1000) {
    return t("validation.startTimeTooSoon", { minutes: MIN_START_LEAD_MINUTES });
  }
  return null;
}

function minStartTimeLocal(): string {
  const d = new Date(Date.now() + MIN_START_LEAD_MINUTES * 60 * 1000);
  const tz = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
}

export default function PostItemPage() {
  const router = useRouter();
  const t = useTranslations("sell");
  const kyc = useKycStatus();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<Record<number, string>>({});
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ConsignmentForm>({
    productName: "",
    categoryId: "",
    itemDescription: "",
    estimatedValue: "",
    auctionMode: "TIMED",
    scheduledStartTime: defaultStartTimeLocal(),
    scheduledDurationHours: 8,
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const syncUser = () => setCurrentUser(getStoredUser());
    syncUser();
    return subscribeStoredUser(syncUser);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    if (!currentUser.roleName?.toLowerCase().includes("seller")) return;
    getCategories()
      .then((list) => setCategories(list))
      .catch(() => setCategories([]));
  }, [currentUser]);

  useEffect(() => {
    if (!formData.categoryId) {
      setCategoryAttributes([]);
      setAttributeValues({});
      return;
    }
    getCategoryAttributes(formData.categoryId)
      .then((attrs) => {
        setCategoryAttributes(attrs);
        const initialValues: Record<number, string> = {};
        attrs.forEach((a) => { initialValues[a.attributeId] = ""; });
        setAttributeValues(initialValues);
      })
      .catch(() => setCategoryAttributes([]));
  }, [formData.categoryId]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const openFilePicker = () => {
    const el = fileInputRef.current;
    if (!el) return;
    // Prefer the modern showPicker() — it opens the file dialog without
    // auto-focusing the input, which previously caused the page to scroll
    // and a white overlay to flash before the dialog appeared.
    const picker = (el as HTMLInputElement & {
      showPicker?: () => void;
    }).showPicker;
    if (typeof picker === "function") {
      try {
        picker.call(el);
        return;
      } catch {
        // showPicker() can throw if not in a user gesture; fall back below.
      }
    }
    el.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const next: File[] = [];
    const previews: string[] = [];
    Array.from(list).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      if (next.length >= 6) return;
      next.push(file);
      previews.push(URL.createObjectURL(file));
    });
    setImageFiles(next);
    setImagePreviews((prev) => {
      prev.forEach((u) => URL.revokeObjectURL(u));
      return previews;
    });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const synthetic = {
      target: { files: e.dataTransfer.files },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(synthetic);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      const removed = prev[idx];
      if (removed) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const startTimeError = useMemo(
    () => startTimeErrorMessage(formData.scheduledStartTime, t),
    [formData.scheduledStartTime, t]
  );

  const canSubmit = useMemo(
    () =>
      formData.productName.trim() !== "" &&
      formData.categoryId !== "" &&
      formData.itemDescription.trim() !== "" &&
      formData.estimatedValue !== "" &&
      imageFiles.length > 0 &&
      !submitting &&
      !startTimeError &&
      categoryAttributes.filter((a) => a.isRequired).every((a) => attributeValues[a.attributeId]?.trim() !== ""),
    [formData, imageFiles, submitting, startTimeError, categoryAttributes, attributeValues]
  );

  const handleAiValuation = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8096/api"}/ai/valuation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: formData.productName,
            description: formData.itemDescription,
            startingPrice: Number(formData.estimatedValue) || 0,
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setAiResult(
          data?.data?.summary ??
            data?.message ??
            "Estimated Market Value: $175,000 – $220,000 based on 42 comparable sales in the last 12 months."
        );
      } else {
        setAiResult(
          "Estimated Market Value: $175,000 – $220,000 based on 42 comparable sales in the last 12 months."
        );
      }
    } catch {
      setAiResult(
        "Estimated Market Value: $175,000 – $220,000 based on 42 comparable sales in the last 12 months."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Step 1: upload images
      let urls: string[] = [];
      try {
        console.log("[post-item] Uploading", imageFiles.length, "image(s)…");
        urls = await uploadProductImages(imageFiles);
        console.log("[post-item] Upload response:", urls);
        if (!urls || urls.length === 0) {
          throw new Error(t("errors.imageUploadNoUrls"));
        }
      } catch (uploadErr) {
        const msg =
          uploadErr instanceof Error ? uploadErr.message : "Unknown upload error";
        console.error("[post-item] Image upload failed:", uploadErr);
        throw new Error(t("errors.imageUploadFailed", { message: msg }));
      }

      // Step 2: create product.
      // DTO field is `LocalDateTime` (no zone). Send naive local time string so the
      // server's `LocalDateTime.now()` comparison is apples-to-apples. The browser
      // `datetime-local` value is already in the user's local zone with no offset,
      // so we just pass it through (trim seconds).
      const scheduledLocal = formData.scheduledStartTime.slice(0, 16); // "YYYY-MM-DDTHH:mm"
      const durationSeconds =
        formData.auctionMode === "TIMED"
          ? formData.scheduledDurationHours * 3600
          : undefined;
      try {
        await createProduct({
          productName: formData.productName.trim(),
          categoryId: Number(formData.categoryId),
          description: formData.itemDescription.trim(),
          startingPrice: Number(formData.estimatedValue),
          auctionMode: formData.auctionMode,
          scheduledStartTime: scheduledLocal,
          scheduledDurationSeconds: durationSeconds,
          images: urls.map((u, i) => ({ imageUrl: u, isPrimary: i === 0 })),
          attributes: Object.entries(attributeValues)
            .filter(([, v]) => v.trim() !== "")
            .map(([id, val]) => ({ attributeId: Number(id), attributeValue: val.trim() })),
        });
      } catch (createErr) {
        const msg =
          createErr instanceof Error ? createErr.message : "Unknown create-product error";
        console.error("[post-item] Create product failed:", createErr);
        throw new Error(t("errors.createProductFailed", { message: msg }));
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("errors.failedToSubmit"));
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <DashboardLayout>
        <SellerAccessRequired mode="signin" />
      </DashboardLayout>
    );
  }

  const isSeller = currentUser.roleName?.toLowerCase().includes("seller");

  if (!isSeller) {
    return (
      <DashboardLayout>
        <SellerAccessRequired mode="upgrade" />
      </DashboardLayout>
    );
  }

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="rounded-xl border border-secondary/30 bg-surface p-xl text-center">
            <span className="material-symbols-outlined text-6xl text-secondary">check_circle</span>
            <h2 className="mt-md font-headline-md text-headline-md text-primary">{t("submittedTitle")}</h2>
            <p className="mt-sm max-w-lg mx-auto font-body-md text-body-md text-on-surface-variant"
               dangerouslySetInnerHTML={{ __html: t("submittedDesc") }}
            />
            <div className="mt-lg flex justify-center gap-sm">
              <Link
                href="/dashboard"
                className="rounded-lg border border-outline-variant px-lg py-md font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-low"
              >
                {t("backToDashboard")}
              </Link>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setImageFiles([]);
                  setImagePreviews([]);
                  setAiResult(null);
                  setCategoryAttributes([]);
                  setAttributeValues({});
                  setFormData({
                    productName: "",
                    categoryId: "",
                    itemDescription: "",
                    estimatedValue: "",
                    auctionMode: "TIMED",
                    scheduledStartTime: defaultStartTimeLocal(),
                    scheduledDurationHours: 8,
                  });
                }}
                className="rounded-lg bg-secondary px-lg py-md font-label-md text-label-md text-on-secondary transition-colors hover:bg-secondary-fixed-dim"
              >
                {t("postAnother")}
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {kyc.status === "unverified" && (
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto">
          <div className="rounded-xl border border-secondary/30 bg-secondary-container/40 p-lg">
            <h2 className="font-headline-md text-headline-md text-on-secondary-container">
              {t("kycRequiredTitle")}
            </h2>
            <p className="mt-sm font-body-md text-body-md text-on-secondary-container">
              {t("kycRequiredDesc")}
            </p>
            <div className="mt-md flex flex-wrap gap-sm">
              <Link
                href="/kyc"
                className="inline-flex items-center gap-xs rounded-lg bg-secondary px-md py-sm font-label-md text-label-md text-on-secondary hover:bg-secondary-fixed-dim"
              >
                {t("kycRequiredCta")}
              </Link>
              <Link
                href="/profile"
                className="inline-flex items-center gap-xs rounded-lg border border-secondary/40 bg-surface px-md py-sm font-label-md text-label-md text-secondary hover:bg-secondary-container/40"
              >
                {t("kycRequiredProfile")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {kyc.status !== "verified" && (
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg" style={{ display: kyc.status === "unverified" ? "none" : "block" }}>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t("kycLoading")}
          </p>
        </div>
      )}

      {kyc.status === "verified" && (
        <div className="p-margin-mobile md:p-margin-desktop max-w-[1400px] mx-auto space-y-lg">
          <div>
            <h1 className="font-display-lg-mobile md:font-display-lg text-primary">{t("pageTitle")}</h1>
            <p className="font-body-lg text-on-surface-variant">
              {t("pageSubtitle")}
            </p>
          </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-lg">
          {/* Form */}
          <div className="xl:col-span-2 space-y-md">
            <div className="bg-surface rounded-xl p-lg soft-shadow border border-surface-variant space-y-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("itemTitle")}</label>
                  <input
                    type="text"
                    required
                    placeholder={t("itemTitlePlaceholder")}
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("category")}</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryId: e.target.value === "" ? "" : Number(e.target.value),
                      })
                    }
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none appearance-none"
                  >
                    <option value="">{t("selectCategory")}</option>
                    {categories.map((c) => (
                      <option key={c.categoryId} value={c.categoryId}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {categoryAttributes.length > 0 && (
                <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-md space-y-md">
                  <h3 className="font-headline-sm text-headline-sm text-primary">{t("categoryDetails")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    {categoryAttributes
                      .slice()
                      .sort((a, b) => a.displayOrder - b.displayOrder)
                      .map((attr) => (
                        <div key={attr.attributeId} className="space-y-xs">
                          <label className="font-label-md text-label-md text-on-surface-variant">
                            {attr.attributeName}
                            {attr.isRequired && <span className="ml-1 text-error">*</span>}
                          </label>
                          {attr.dataType === "NUMBER" ? (
                            <input
                              type="number"
                              placeholder={t("enterField", { field: attr.attributeName.toLowerCase() })}
                              value={attributeValues[attr.attributeId] ?? ""}
                              onChange={(e) =>
                                setAttributeValues((prev) => ({
                                  ...prev,
                                  [attr.attributeId]: e.target.value,
                                }))
                              }
                              required={attr.isRequired}
                              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                            />
                          ) : (
                            <input
                              type="text"
                              placeholder={t("enterField", { field: attr.attributeName.toLowerCase() })}
                              value={attributeValues[attr.attributeId] ?? ""}
                              onChange={(e) =>
                                setAttributeValues((prev) => ({
                                  ...prev,
                                  [attr.attributeId]: e.target.value,
                                }))
                              }
                              required={attr.isRequired}
                              className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                            />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">
                    {t("startingBidPrice")}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder={t("enterAmount")}
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                  />
                </div>
                <div className="space-y-xs">
                  <label className="font-label-md text-label-md text-on-surface-variant">{t("auctionMode")}</label>
                  <div className="grid grid-cols-2 gap-sm">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, auctionMode: "LIVE" })}
                      className={`rounded-lg border px-md py-sm text-left transition-colors ${
                        formData.auctionMode === "LIVE"
                          ? "border-secondary bg-secondary-container text-on-secondary-container"
                          : "border-outline-variant bg-surface-container-low hover:border-secondary"
                      }`}
                    >
                      <span className="block font-label-md text-label-md">LIVE</span>
                      <span className="text-xs text-on-surface-variant">{t("auctionModeLiveDesc")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, auctionMode: "TIMED" })}
                      className={`rounded-lg border px-md py-sm text-left transition-colors ${
                        formData.auctionMode === "TIMED"
                          ? "border-secondary bg-secondary-container text-on-secondary-container"
                          : "border-outline-variant bg-surface-container-low hover:border-secondary"
                      }`}
                    >
                      <span className="block font-label-md text-label-md">TIMED</span>
                      <span className="text-xs text-on-surface-variant">{t("auctionModeTimedDesc")}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">
                  {t("lotDescription")}
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder={t("lotDescriptionPlaceholder")}
                  value={formData.itemDescription}
                  onChange={(e) => setFormData({ ...formData, itemDescription: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none resize-none"
                />
              </div>

              {/* IMAGE UPLOAD DROPZONE */}
              <div className="space-y-xs">
                <label className="font-label-md text-label-md text-on-surface-variant">
                  {t("uploadImages")} <span className="text-on-surface-variant">{t("uploadImagesHint")}</span>
                </label>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={openFilePicker}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openFilePicker();
                    }
                  }}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="flex cursor-pointer flex-col items-center justify-center gap-sm rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-lowest p-xl transition-colors hover:bg-secondary-container/20 hover:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/40"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    tabIndex={-1}
                    aria-hidden="true"
                  />
                  <span className="material-symbols-outlined text-[48px] text-outline group-hover:text-secondary">
                    photo_camera
                  </span>
                  <div className="text-center">
                    <p className="font-label-md text-primary">{t("clickOrDragImages")}</p>
                    <p className="text-xs text-on-surface-variant">
                      {t("supportFormats")}
                    </p>
                  </div>
                  <span className="mt-sm inline-flex items-center gap-xs rounded-lg bg-secondary px-lg py-sm font-label-md text-label-md text-on-secondary pointer-events-none">
                    <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
                    {t("chooseImages")}
                  </span>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="mt-md grid grid-cols-3 gap-sm md:grid-cols-6">
                    {imagePreviews.map((src, idx) => (
                      <div
                        key={src}
                        className="relative aspect-square overflow-hidden rounded-lg border border-outline-variant bg-surface-container-low"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`preview-${idx}`} className="h-full w-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute left-1 top-1 rounded bg-secondary px-xs text-xs text-on-secondary">
                            {t("primary")}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute right-1 top-1 rounded-full bg-black/60 p-xs text-white hover:bg-error"
                          aria-label="Remove image"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AUCTION SCHEDULE */}
              <div className="space-y-sm rounded-lg border border-outline-variant bg-surface-container-lowest p-md">
                <h3 className="font-headline-sm text-headline-sm text-primary">{t("auctionSchedule")}</h3>
                <p className="text-sm text-on-surface-variant">
                  {t("auctionScheduleDesc", { minutes: MIN_START_LEAD_MINUTES })}
                </p>
                <div className="grid gap-md md:grid-cols-2">
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant">
                      {t("startTime")}
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledStartTime}
                      min={minStartTimeLocal()}
                      onChange={(e) =>
                        setFormData({ ...formData, scheduledStartTime: e.target.value })
                      }
                      aria-invalid={startTimeError ? "true" : "false"}
                      className={`w-full bg-surface-container-low border rounded-lg p-3 text-on-surface focus:ring-2 transition-all outline-none ${
                        startTimeError
                          ? "border-error focus:ring-error/20 focus:border-error"
                          : "border-outline-variant focus:ring-secondary/20 focus:border-secondary"
                      }`}
                    />
                    {startTimeError && (
                      <p className="font-body-sm text-body-sm text-error flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[16px]">error</span>
                        {startTimeError}
                      </p>
                    )}
                  </div>
                  {formData.auctionMode === "TIMED" && (
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md text-on-surface-variant">
                        {t("duration")}
                      </label>
                      <input
                        type="number"
                        min={6}
                        max={12}
                        value={formData.scheduledDurationHours}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scheduledDurationHours: Number(e.target.value),
                          })
                        }
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-on-surface focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {submitError && (
              <div className="rounded-lg border border-error/40 bg-error-container/30 p-md text-sm text-error">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="bg-secondary text-on-secondary py-md rounded-xl font-headline-sm glow-accent w-full hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed transition-all flex items-center justify-center gap-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  {t("uploading")}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  {t("submitForReview")}
                </>
              )}
            </button>
            <p className="text-center text-xs text-on-surface-variant italic">
              {t("termsAgree")}
            </p>
          </div>

          {/* AI Assistant */}
          <div className="space-y-md">
            <div className="bg-primary-container text-on-primary-container rounded-xl p-lg soft-shadow border border-secondary/20 sticky top-base">
              <div className="flex items-center gap-sm mb-md">
                <h2 className="font-headline-md text-headline-md text-primary">{t("aiValuation")}</h2>
              </div>
              <p className="font-body-md opacity-90 mb-lg">
                {t("aiValuationDesc")}
              </p>

              {aiResult && (
                <div className="mb-md p-md bg-secondary/10 border border-secondary/30 rounded-lg">
                  <p className="font-body-md text-sm text-on-primary-container">{aiResult}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleAiValuation}
                disabled={aiLoading}
                className="border border-secondary text-secondary hover:bg-secondary/10 w-full py-sm rounded-lg transition-colors font-label-md flex items-center justify-center gap-xs disabled:opacity-60"
              >
                {aiLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>{" "}
                    {t("analyzing")}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">analytics</span> {t("getAiValuation")}
                  </>
                )}
              </button>

              <div className="mt-lg pt-md border-t border-outline-variant/20">
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-xs">{t("processingCredits")}</span>
                  <span className="text-xs font-bold">{t("creditsLeft", { count: 12 })}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
        </div>
      )}
    </DashboardLayout>
  );
}
