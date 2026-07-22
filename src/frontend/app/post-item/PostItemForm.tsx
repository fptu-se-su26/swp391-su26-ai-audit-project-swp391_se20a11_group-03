"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  aiApi,
  ApiError,
  productApi,
  toImageSrc,
  uploadImages,
  userApi,
  type Category,
} from "@/lib/api";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(file);
  });
}

type Picked = { file: File; preview: string };
type ExistingImage = { imageUrl: string; isPrimary: boolean };
type KycAccess = "checking" | "verified" | "unverified" | "error";

type PostItemFormProps = {
  editProductId?: number;
};

export default function PostItemForm({ editProductId }: PostItemFormProps) {
  const t = useTranslations("postItem");
  const router = useRouter();
  const isEditing = editProductId !== undefined;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [startingPrice, setStartingPrice] = useState("");
  const [description, setDescription] = useState("");
  const [picked, setPicked] = useState<Picked[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(isEditing);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiRemaining, setAiRemaining] = useState<number | null>(null);
  const [kycAccess, setKycAccess] = useState<KycAccess>("checking");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;

    userApi
      .profile()
      .then((response) => {
        if (cancelled) return;
        const profile = response.data;
        const isAdmin = profile.roleName?.toLowerCase() === "admin";
        setKycAccess(profile.identityVerified || isAdmin ? "verified" : "unverified");
      })
      .catch(() => {
        if (!cancelled) setKycAccess("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    aiApi
      .valuationQuota()
      .then((response) => {
        if (!cancelled) setAiRemaining(response.data.remaining);
      })
      .catch(() => {
        /* Non-critical: leave remaining count unknown if this fails. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function retryKycAccess() {
    setKycAccess("checking");
    try {
      const response = await userApi.profile();
      const profile = response.data;
      const isAdmin = profile.roleName?.toLowerCase() === "admin";
      setKycAccess(profile.identityVerified || isAdmin ? "verified" : "unverified");
    } catch {
      // Lock the form when KYC status cannot be determined.
      setKycAccess("error");
    }
  }

  useEffect(() => {
    if (kycAccess !== "verified") return;

    let cancelled = false;

    Promise.all([
      productApi.categories(),
      editProductId !== undefined ? productApi.sellerDetail(editProductId) : Promise.resolve(null),
    ])
      .then(([categoryResponse, productResponse]) => {
        if (cancelled) return;

        const list = categoryResponse.data ?? [];
        setCategories(list);

        if (!productResponse) {
          if (list.length > 0) setCategoryId(list[0].categoryId);
          return;
        }

        const product = productResponse.data;
        const status = product.status.toUpperCase();
        if (!["PENDING", "REJECTED"].includes(status)) {
          setError(t("editStatusError"));
          return;
        }

        setName(product.productName);
        setCategoryId(product.categoryId ?? "");
        setStartingPrice(String(product.startingPrice));
        setDescription(product.description ?? "");
        setRejectionReason(product.rejectionReason);
        setExistingImages(
          [...(product.images ?? [])]
            .sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary))
            .map((image) => ({ imageUrl: image.imageUrl, isPrimary: image.isPrimary })),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setCategories([]);
        setError(
          err instanceof ApiError
            ? err.message
            : t("loadProductError"),
        );
      })
      .finally(() => {
        if (!cancelled) setLoadingProduct(false);
      });

    return () => {
      cancelled = true;
    };
  }, [editProductId, isEditing, kycAccess, t]);

  // Release object URLs on unmount to avoid leaks.
  useEffect(() => {
    return () => picked.forEach((p) => URL.revokeObjectURL(p.preview));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPicked((prev) => [...prev, ...next]);
  }

  function removeAt(index: number) {
    setPicked((prev) => {
      const target = prev[index];
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function removeExistingAt(index: number) {
    setExistingImages((prev) => prev.filter((_, imageIndex) => imageIndex !== index));
  }

  async function handleGetValuation() {
    if (!name.trim()) {
      setAiResult(t("aiNeedName"));
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      // Include up to 3 photos (base64) so the model can judge condition/rarity.
      const images = await Promise.all(
        picked.slice(0, 3).map(async (p) => ({
          mimeType: p.file.type || "image/jpeg",
          base64: await fileToBase64(p.file),
        })),
      );
      const priceNum = Number(startingPrice);
      const res = await aiApi.valuation({
        productName: name.trim(),
        description: description.trim() || undefined,
        startingPrice: Number.isFinite(priceNum) && priceNum > 0 ? priceNum : undefined,
        images,
      });
      const d = res.data;
      const currency = d.currency ?? "VND";
      const fmt = (n: number) =>
        currency === "VND" ? `${n.toLocaleString("vi-VN")} ₫` : `${currency} ${n.toLocaleString()}`;
      const range =
        d.lowEstimate != null && d.highEstimate != null
          ? `${t("aiRange", { low: fmt(d.lowEstimate), high: fmt(d.highEstimate) })} `
          : "";
      setAiResult(range + (d.summary || d.reply || t("aiDone")));
      if (d.remaining != null) setAiRemaining(d.remaining);
    } catch (err) {
      setAiResult(
        err instanceof ApiError ? err.message : t("aiError"),
      );
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (kycAccess !== "verified") {
      setError(t("kycRequiredError"));
      return;
    }

    if (!name.trim()) return setError(t("nameRequired"));
    if (categoryId === "") return setError(t("categoryRequired"));
    const price = Number(startingPrice);
    if (!Number.isFinite(price) || price <= 0)
      return setError(t("priceRequired"));
    if (existingImages.length + picked.length === 0)
      return setError(t("imageRequired"));

    setSubmitting(true);
    try {
      const uploadedUrls = picked.length
        ? await uploadImages(picked.map((pickedImage) => pickedImage.file))
        : [];
      const imageUrls = [
        ...existingImages.map((image) => image.imageUrl),
        ...uploadedUrls,
      ];
      const images = imageUrls.map((imageUrl, index) => ({
        imageUrl,
        isPrimary: index === 0,
      }));

      if (isEditing && editProductId !== undefined) {
        await productApi.update(editProductId, {
          productName: name.trim(),
          description: description.trim(),
          startingPrice: price,
          images,
        });
        setSuccess(t("updateSuccess"));
        setRejectionReason(null);
      } else {
        await productApi.create({
          categoryId: Number(categoryId),
          productName: name.trim(),
          description: description.trim() || undefined,
          startingPrice: price,
          images,
        });
        setSuccess(t("createSuccess"));
      }

      picked.forEach((p) => URL.revokeObjectURL(p.preview));
      setPicked([]);
      if (!isEditing) {
        setName("");
        setStartingPrice("");
        setDescription("");
      }
      setTimeout(() => router.push("/inventory"), 1200);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : isEditing
            ? t("updateError")
            : t("createError"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (kycAccess === "checking") {
    return (
      <div className="glass-panel col-span-full flex min-h-[430px] items-center justify-center rounded-2xl p-8">
        <div className="text-center" role="status" aria-live="polite">
          <span className="material-symbols-outlined animate-pulse text-5xl text-[var(--luxora-gold-light)]">
            verified_user
          </span>
          <p className="mt-4 text-lg font-semibold">{t("checkingKycTitle")}</p>
          <p className="mt-1 text-sm text-white/45">{t("checkingKycDesc")}</p>
        </div>
      </div>
    );
  }

  if (kycAccess !== "verified") {
    const unavailable = kycAccess === "error";
    return (
      <div className="glass-panel col-span-full flex min-h-[430px] items-center justify-center rounded-2xl border border-yellow-500/20 p-8">
        <div className="max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-yellow-500/25 bg-yellow-500/10">
            <span className="material-symbols-outlined text-4xl text-yellow-300">
              gpp_maybe
            </span>
          </div>
          <h2 className="font-headline-md mt-6 text-2xl">
            {unavailable ? t("kycUnavailableTitle") : t("kycMissingTitle")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-white/55">
            {unavailable
              ? t("kycUnavailableDesc")
              : t("kycMissingDesc")}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            {unavailable && (
              <button
                type="button"
                onClick={() => {
                  void retryKycAccess();
                }}
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold hover:bg-white/5"
              >
                {t("retryKyc")}
              </button>
            )}
            <Link
              href="/kyc"
              className="gradient-cta inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-semibold text-black"
            >
              <span className="material-symbols-outlined text-lg">verified_user</span>
              {t("verifyKycNow")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loadingProduct) {
    return (
      <div className="glass-panel col-span-full flex min-h-[430px] items-center justify-center rounded-2xl p-8">
        <div className="text-center" role="status" aria-live="polite">
          <span className="material-symbols-outlined animate-pulse text-5xl text-[var(--luxora-gold-light)]">
            inventory_2
          </span>
          <p className="mt-4 text-lg font-semibold">{t("loadingProduct")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Form (2/3) */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel flex flex-col gap-5 rounded-2xl p-6 lg:col-span-2"
      >
        {isEditing && rejectionReason && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <p className="font-semibold">{t("rejectionReason")}</p>
            <p className="mt-1 text-red-200/80">{rejectionReason}</p>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            {t("productName")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("productNamePlaceholder")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            {t("category")}
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
            disabled={isEditing}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-[var(--luxora-gold)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {categories.length === 0 && <option value="">{t("loadingCategories")}</option>}
            {categories.map((c) => (
              <option key={c.categoryId} value={c.categoryId} className="bg-[var(--luxora-bg-elevated)]">
                {c.categoryName}
              </option>
            ))}
          </select>
          {isEditing && (
            <p className="mt-1.5 text-[11px] text-white/35">
              {t("categoryLocked")}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            {t("startingPrice")}
          </label>
          <input
            type="number"
            value={startingPrice}
            onChange={(e) => setStartingPrice(e.target.value)}
            placeholder="0"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            {t("description")}
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            {t("uploadImages")}
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-10 text-center hover:border-[var(--luxora-gold)]"
          >
            <span className="material-symbols-outlined text-3xl text-white/30">
              cloud_upload
            </span>
            <p className="text-sm text-white/50">
              {t("dropImages")}
            </p>
            <p className="text-xs text-white/30">{t("imageHint")}</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />

          {existingImages.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {existingImages.map((image, index) => (
                <div
                  key={`${image.imageUrl}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-white/10"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={toImageSrc(image.imageUrl)}
                    alt={t("productImageAlt", { number: index + 1 })}
                    className="h-full w-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-[var(--luxora-gold)] px-1.5 py-0.5 text-[9px] font-semibold text-black">
                      {t("primaryImage")}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingAt(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white/80 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={t("removeProductImage", { number: index + 1 })}
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {picked.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {picked.map((p, i) => (
                <div key={p.preview} className="group relative aspect-square overflow-hidden rounded-lg border border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.preview} alt="preview" className="h-full w-full object-cover" />
                  {existingImages.length === 0 && i === 0 && (
                    <span className="absolute left-1 top-1 rounded bg-[var(--luxora-gold)] px-1.5 py-0.5 text-[9px] font-semibold text-black">
                      {t("primaryImage")}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAt(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white/80 opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label={t("removeImage")}
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="gradient-cta mt-2 rounded-full py-3.5 text-sm font-semibold text-black disabled:opacity-60"
        >
          {submitting
            ? t("submitting")
            : isEditing
              ? t("submitEdit")
              : t("submitCreate")}
        </button>
      </form>

      {/* AI Valuation Assistant */}
      <aside className="glass-panel sticky top-24 h-fit rounded-2xl p-6 lg:col-span-1">
        <p className="text-sm font-semibold">{t("aiTitle")}</p>
        <p className="mt-1 text-xs text-white/50">
          {t("aiDesc")}
        </p>

        <button
          type="button"
          onClick={handleGetValuation}
          disabled={aiLoading || aiRemaining === 0}
          className="gradient-cta mt-5 w-full rounded-full py-3 text-sm font-semibold text-black disabled:opacity-60"
        >
          {aiLoading ? t("aiLoading") : t("aiButton")}
        </button>

        {aiResult && (
          <div className="mt-4 rounded-xl border border-[var(--luxora-gold)]/30 bg-[var(--luxora-gold)]/5 p-4 text-sm text-[var(--luxora-gold-light)]">
            {aiResult}
          </div>
        )}

        {aiRemaining != null && (
          <p className="mt-4 text-[11px] text-white/30">
            {t("aiRemaining", { count: aiRemaining })}
          </p>
        )}
      </aside>
    </div>
  );
}
