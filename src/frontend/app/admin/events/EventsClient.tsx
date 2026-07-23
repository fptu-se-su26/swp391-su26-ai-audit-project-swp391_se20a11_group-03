"use client";

import { useMemo, useState } from "react";
import {
  adminApi,
  type AdminEvent,
  type BiddingModeValue,
  type EventCategoryValue,
  type EventMoneyModeValue,
  type EventStatusValue,
  uploadImages,
} from "@/lib/api";
import { useApiData } from "@/lib/use-api-data";
import EventProductsPanel from "./EventProductsPanel";

type EventFormState = {
  name: string;
  slug: string;
  description: string;
  bannerUrl: string;
  eventCategory: EventCategoryValue;
  biddingMode: BiddingModeValue;
  moneyMode: EventMoneyModeValue;
  depositAmount: string;
  isCharity: boolean;
  charityPercent: string;
  registrationOpenAt: string;
  registrationDeadline: string;
  startTime: string;
  endTime: string;
  rulesText: string;
  rewardDescription: string;
  allowSellerSubmission: boolean;
  dutchConfigJson: string;
  sealedConfigJson: string;
  pennyConfigJson: string;
};

const statusColors: Record<EventStatusValue, string> = {
  DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  PUBLISHED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ONGOING: "bg-green-500/20 text-green-400 border-green-500/30",
  ENDED: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELLED: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  ARCHIVED: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

const biddingModeOptions: { value: BiddingModeValue; label: string; hint: string }[] = [
  { value: "STANDARD", label: "Tiêu chuẩn", hint: "Đấu giá chuẩn, không cần config riêng." },
  { value: "DUTCH", label: "Kiểu Hà Lan", hint: "Đấu giá Hà Lan, cần cấu hình giảm giá." },
  { value: "SEALED_BID", label: "Đấu giá kín", hint: "Đấu giá kín, cần cấu hình lượt reveal." },
  { value: "PENNY", label: "Đấu giá xu", hint: "Đấu giá xu, cần cấu hình bước giá/time extend." },
];

const categoryOptions: { value: EventCategoryValue; label: string }[] = [
  { value: "GENERAL", label: "Tổng hợp" },
  { value: "THEMED", label: "Theo chủ đề" },
  { value: "CHARITY", label: "Từ thiện" },
];

const defaultDutchConfig = JSON.stringify({ startPrice: 10000000, decrementAmount: 250000, decrementEverySeconds: 60 }, null, 2);
const defaultSealedConfig = JSON.stringify({ allowReveal: true, revealAt: null }, null, 2);
const defaultPennyConfig = JSON.stringify({ bidIncrement: 1000, timeExtensionSeconds: 15 }, null, 2);
const inputClassName = "w-full rounded-xl border border-[#d8d0c4] bg-white px-4 py-3 text-sm text-[#1f1a14] outline-none transition focus:border-[#d4aa61] focus:ring-2 focus:ring-[#f0c982]/30";
const textareaClassName = "w-full rounded-xl border border-[#d8d0c4] bg-white px-4 py-3 text-sm text-[#1f1a14] outline-none transition focus:border-[#d4aa61] focus:ring-2 focus:ring-[#f0c982]/30";
const checkboxCardClassName = "flex items-center gap-3 rounded-xl border border-[#d8d0c4] bg-[#faf7f1] px-4 py-3 text-sm text-[#1f1a14]";

const emptyForm = (): EventFormState => ({
  name: "",
  slug: "",
  description: "",
  bannerUrl: "",
  eventCategory: "GENERAL",
  biddingMode: "STANDARD",
  moneyMode: "REAL",
  depositAmount: "",
  isCharity: false,
  charityPercent: "",
  registrationOpenAt: "",
  registrationDeadline: "",
  startTime: "",
  endTime: "",
  rulesText: "",
  rewardDescription: "",
  allowSellerSubmission: true,
  dutchConfigJson: "",
  sealedConfigJson: "",
  pennyConfigJson: "",
});

async function loadEvents(): Promise<AdminEvent[]> {
  return (await adminApi.events()).data ?? [];
}

function formatDateRange(startTime: string, endTime: string) {
  return `${new Date(startTime).toLocaleDateString("vi-VN")} - ${new Date(endTime).toLocaleDateString("vi-VN")}`;
}

function formatPreviewDateRange(startTime: string, endTime: string) {
  if (!startTime || !endTime) return "Chọn thời gian bắt đầu và kết thúc";
  return formatDateRange(startTime, endTime);
}

function toDateTimeLocal(value: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toPayload(form: EventFormState) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim(),
    bannerUrl: form.bannerUrl.trim(),
    eventCategory: form.eventCategory,
    biddingMode: form.biddingMode,
    moneyMode: form.moneyMode,
    depositAmount:
      form.moneyMode === "VIRTUAL" && form.depositAmount ? Number(form.depositAmount) : null,
    isCharity: form.isCharity,
    charityPercent: form.isCharity && form.charityPercent ? Number(form.charityPercent) : null,
    registrationOpenAt: form.registrationOpenAt || null,
    registrationDeadline: form.registrationDeadline || null,
    startTime: form.startTime,
    endTime: form.endTime,
    rulesText: form.rulesText.trim(),
    rewardDescription: form.rewardDescription.trim(),
    allowSellerSubmission: form.allowSellerSubmission,
    dutchConfigJson: form.biddingMode === "DUTCH" ? form.dutchConfigJson.trim() : null,
    sealedConfigJson: form.biddingMode === "SEALED_BID" ? form.sealedConfigJson.trim() : null,
    pennyConfigJson: form.biddingMode === "PENNY" ? form.pennyConfigJson.trim() : null,
  };
}

function fromEvent(event: AdminEvent): EventFormState {
  return {
    name: event.name ?? "",
    slug: event.slug ?? "",
    description: event.description ?? "",
    bannerUrl: event.bannerUrl ?? "",
    eventCategory: event.eventCategory ?? "GENERAL",
    biddingMode: event.biddingMode ?? "STANDARD",
    moneyMode: event.moneyMode ?? "REAL",
    depositAmount: event.depositAmount != null ? String(event.depositAmount) : "",
    isCharity: Boolean(event.isCharity),
    charityPercent: event.charityPercent ? String(event.charityPercent) : "",
    registrationOpenAt: toDateTimeLocal(event.registrationOpenAt),
    registrationDeadline: toDateTimeLocal(event.registrationDeadline),
    startTime: toDateTimeLocal(event.startTime),
    endTime: toDateTimeLocal(event.endTime),
    rulesText: event.rulesText ?? "",
    rewardDescription: event.rewardDescription ?? "",
    allowSellerSubmission: Boolean(event.allowSellerSubmission),
    dutchConfigJson: event.dutchConfigJson ?? "",
    sealedConfigJson: event.sealedConfigJson ?? "",
    pennyConfigJson: event.pennyConfigJson ?? "",
  };
}

export default function EventsClient() {
  const { data: events, setData, loading, error, reload } = useApiData(loadEvents, []);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [form, setForm] = useState<EventFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  const currentModeHint = useMemo(
    () => biddingModeOptions.find((item) => item.value === form.biddingMode)?.hint ?? "",
    [form.biddingMode],
  );
  const previewTitle = form.name.trim() || "Tiêu đề sự kiện sẽ hiển thị ở đây";
  const previewSummary = form.description.trim() || "Tóm tắt ngắn về nội dung sự kiện sẽ hiển thị ở đây.";
  const previewBanner = form.bannerUrl.trim();

  function closeModal() {
    setShowModal(false);
    setEditingEventId(null);
    setForm(emptyForm());
    setFormError(null);
  }

  function openCreateModal() {
    setEditingEventId(null);
    setForm(emptyForm());
    setFormError(null);
    setShowModal(true);
  }

  function openEditModal(event: AdminEvent) {
    setEditingEventId(event.eventId);
    setForm(fromEvent(event));
    setFormError(null);
    setShowModal(true);
  }

  function updateForm<K extends keyof EventFormState>(key: K, value: EventFormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "name" && (!current.slug || current.slug === slugify(current.name))) {
        next.slug = slugify(String(value));
      }
      if (key === "biddingMode") {
        if (value === "DUTCH" && !current.dutchConfigJson) next.dutchConfigJson = defaultDutchConfig;
        if (value === "SEALED_BID" && !current.sealedConfigJson) next.sealedConfigJson = defaultSealedConfig;
        if (value === "PENNY" && !current.pennyConfigJson) next.pennyConfigJson = defaultPennyConfig;
      }
      return next;
    });
  }

  async function handleBannerUpload(file: File | null) {
    if (!file) return;
    setIsUploadingBanner(true);
    setFormError(null);
    try {
      const [uploadedUrl] = await uploadImages([file]);
      if (!uploadedUrl) {
        throw new Error("Upload ảnh thất bại, chưa nhận được URL.");
      }
      updateForm("bannerUrl", uploadedUrl);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Không thể upload ảnh tiêu đề");
    } finally {
      setIsUploadingBanner(false);
    }
  }

  async function submitForm() {
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload = toPayload(form);
      if (editingEventId == null) {
        const response = await adminApi.createEvent(payload);
        setData((items) => [response.data, ...items]);
        // Stay in the modal, now in "edit" mode, so the product-management
        // panel (which needs a real eventId) becomes available immediately
        // instead of forcing a second click on "Sửa".
        setEditingEventId(response.data.eventId);
        setForm(fromEvent(response.data));
      } else {
        const response = await adminApi.updateEvent(editingEventId, payload);
        setData((items) => items.map((item) => (item.eventId === editingEventId ? response.data : item)));
        closeModal();
      }
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Không thể lưu sự kiện");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeEvent(event: AdminEvent) {
    if (!window.confirm(`Xóa sự kiện "${event.name}"?`)) return;
    try {
      await adminApi.deleteEvent(event.eventId);
      setData((items) => items.filter((item) => item.eventId !== event.eventId));
    } catch (cause) {
      window.alert(cause instanceof Error ? cause.message : "Không thể xóa sự kiện");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-3xl">Quản lý sự kiện</h1>
          <p className="mt-2 text-sm text-white/55">
            Hệ thống hiện hỗ trợ {biddingModeOptions.length} thể loại đấu giá:
            {" "}
            {biddingModeOptions.map((item) => item.label).join(", ")}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="gradient-cta rounded-full px-5 py-2.5 text-sm font-semibold text-black"
        >
          Thêm sự kiện
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <div key={event.eventId} className="glass-card rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--luxora-gold)]/10 text-[var(--luxora-gold)]">
                <span className="material-symbols-outlined">event</span>
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{event.name}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusColors[event.status]}`}>
                    {event.status}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/70">
                    {event.biddingMode}
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/60">{formatDateRange(event.startTime, event.endTime)}</p>
            <p className="mt-2 text-xs text-white/45">Phân loại: {event.eventCategory}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => openEditModal(event)}
                className="flex-1 rounded-full border border-white/15 py-2 text-xs font-semibold hover:border-[#f0c982] hover:text-[#f0c982]"
              >
                Sửa
              </button>
              <button
                type="button"
                onClick={() => void removeEvent(event)}
                className="flex-1 rounded-full border border-white/15 py-2 text-xs font-semibold hover:border-red-400 hover:text-red-300"
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {!loading && events.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-white/45">{error ?? "Chưa có sự kiện nào."}</p>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-[#d9d1c5] bg-[#f5f0e8] p-6 text-[#1f1a14] shadow-2xl">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
              <div>
                <h2 className="font-headline-md text-2xl font-semibold">{editingEventId == null ? "Tạo sự kiện mới" : "Cập nhật sự kiện"}</h2>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} placeholder="Tiêu đề sự kiện" className={inputClassName} />
                  <input value={form.slug} onChange={(event) => updateForm("slug", event.target.value)} placeholder="Slug URL" className={inputClassName} />
                  <select value={form.biddingMode} onChange={(event) => updateForm("biddingMode", event.target.value as BiddingModeValue)} className={inputClassName}>
                    {biddingModeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                  <select value={form.eventCategory} onChange={(event) => updateForm("eventCategory", event.target.value as EventCategoryValue)} className={inputClassName}>
                    {categoryOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                  </select>
                  <select value={form.moneyMode} onChange={(event) => updateForm("moneyMode", event.target.value as EventMoneyModeValue)} className={inputClassName}>
                    <option value="REAL">Tiền thật (khóa ví khi đấu, không cọc)</option>
                    <option value="VIRTUAL">Tiền ảo (đấu miễn phí, cọc khi đăng ký)</option>
                  </select>
                  {form.moneyMode === "VIRTUAL" && (
                    <input
                      type="number"
                      min={0}
                      value={form.depositAmount}
                      onChange={(event) => updateForm("depositAmount", event.target.value)}
                      placeholder="Mức cọc khi đăng ký (VND)"
                      className={inputClassName}
                    />
                  )}
                  <div className="md:col-span-2">
                    <input value={form.bannerUrl} onChange={(event) => updateForm("bannerUrl", event.target.value)} placeholder="Banner URL" className={inputClassName} />
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center rounded-full border border-[#d8d0c4] bg-white px-4 py-2 text-sm font-semibold text-[#1f1a14] transition hover:border-[#d4aa61] hover:text-[#a57a2a]">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            void handleBannerUpload(file);
                            event.currentTarget.value = "";
                          }}
                        />
                        {isUploadingBanner ? "Đang upload ảnh..." : "Upload ảnh tiêu đề"}
                      </label>
                      <span className="text-xs text-[#7b7268]">
                        Bạn có thể upload ảnh trực tiếp hoặc dán `Banner URL` thủ công.
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-[#7b7268]">
                      Đây là ảnh lớn hiển thị ở đầu card event và trang chi tiết.
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="Tóm tắt nội dung sự kiện" className={`${textareaClassName} min-h-28`} />
                    <p className="mt-2 text-xs text-[#7b7268]">
                      Trường này chính là phần mô tả ngắn hiển thị dưới tiêu đề, giống như ảnh bạn gửi.
                    </p>
                  </div>
                  <div className="md:col-span-2 rounded-2xl border border-[#ddd4c8] bg-[#fcfaf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57a2a]">Thời gian đăng ký</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[#534a3f]">Mở đăng ký</span>
                        <input
                          type="datetime-local"
                          value={form.registrationOpenAt}
                          onChange={(event) => updateForm("registrationOpenAt", event.target.value)}
                          className={inputClassName}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[#534a3f]">Đóng đăng ký</span>
                        <input
                          type="datetime-local"
                          value={form.registrationDeadline}
                          onChange={(event) => updateForm("registrationDeadline", event.target.value)}
                          className={inputClassName}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="md:col-span-2 rounded-2xl border border-[#ddd4c8] bg-[#fcfaf6] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57a2a]">Thời gian sự kiện</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[#534a3f]">Bắt đầu sự kiện</span>
                        <input
                          type="datetime-local"
                          value={form.startTime}
                          onChange={(event) => updateForm("startTime", event.target.value)}
                          className={inputClassName}
                        />
                      </label>
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-[#534a3f]">Kết thúc sự kiện</span>
                        <input
                          type="datetime-local"
                          value={form.endTime}
                          onChange={(event) => updateForm("endTime", event.target.value)}
                          className={inputClassName}
                        />
                      </label>
                    </div>
                  </div>
                  <label className={checkboxCardClassName}>
                    <input type="checkbox" checked={form.allowSellerSubmission} onChange={(event) => updateForm("allowSellerSubmission", event.target.checked)} />
                    Cho seller nộp sản phẩm vào event
                  </label>
                  <label className={checkboxCardClassName}>
                    <input type="checkbox" checked={form.isCharity} onChange={(event) => updateForm("isCharity", event.target.checked)} />
                    Event từ thiện
                  </label>
                  {form.isCharity && (
                    <input value={form.charityPercent} onChange={(event) => updateForm("charityPercent", event.target.value)} placeholder="Phần trăm charity" className={inputClassName} />
                  )}
                  <div className="md:col-span-2 rounded-xl border border-[#d8d0c4] bg-[#faf7f1] px-4 py-3 text-xs text-[#6e6559]">{currentModeHint}</div>
                  {form.biddingMode === "DUTCH" && (
                    <textarea value={form.dutchConfigJson} onChange={(event) => updateForm("dutchConfigJson", event.target.value)} placeholder="Dutch config JSON" className={`${textareaClassName} md:col-span-2 min-h-28 font-mono`} />
                  )}
                  {form.biddingMode === "SEALED_BID" && (
                    <textarea value={form.sealedConfigJson} onChange={(event) => updateForm("sealedConfigJson", event.target.value)} placeholder="Sealed config JSON" className={`${textareaClassName} md:col-span-2 min-h-28 font-mono`} />
                  )}
                  {form.biddingMode === "PENNY" && (
                    <textarea value={form.pennyConfigJson} onChange={(event) => updateForm("pennyConfigJson", event.target.value)} placeholder="Penny config JSON" className={`${textareaClassName} md:col-span-2 min-h-28 font-mono`} />
                  )}
                  <textarea value={form.rulesText} onChange={(event) => updateForm("rulesText", event.target.value)} placeholder="Thể lệ / nội dung đầy đủ" className={`${textareaClassName} min-h-28`} />
                  <textarea value={form.rewardDescription} onChange={(event) => updateForm("rewardDescription", event.target.value)} placeholder="Mô tả phần thưởng" className={`${textareaClassName} min-h-28`} />
                  {editingEventId != null && (
                    <EventProductsPanel key={editingEventId} eventId={editingEventId} />
                  )}
                </div>
                {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}
                <div className="mt-6 flex gap-3">
                  <button type="button" onClick={closeModal} className="flex-1 rounded-full border border-[#d8d0c4] bg-white py-3 text-sm font-semibold text-[#1f1a14]">Hủy</button>
                  <button type="button" onClick={() => void reload()} className="rounded-full border border-[#d8d0c4] bg-white px-5 py-3 text-sm font-semibold text-[#1f1a14]">Tải lại</button>
                  <button type="button" disabled={isSubmitting || !form.name.trim() || !form.slug.trim() || !form.startTime || !form.endTime} onClick={() => void submitForm()} className="gradient-cta flex-1 rounded-full py-3 text-sm font-semibold text-black disabled:opacity-40">
                    {isSubmitting ? "Đang lưu..." : editingEventId == null ? "Tạo" : "Cập nhật"}
                  </button>
                </div>
              </div>

              <div className="xl:sticky xl:top-0">
                <div className="rounded-[28px] border border-[#ddd4c8] bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a57a2a]">Xem trước thẻ sự kiện</p>
                  <div className="mt-4 overflow-hidden rounded-[24px] border border-[#e3dbcf] bg-white">
                    <div className="relative h-60 bg-[#ece5d8]">
                      {previewBanner ? (
                        // The admin preview intentionally accepts an arbitrary URL before save;
                        // Next Image only permits hostnames declared at build time.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={previewBanner}
                          alt={previewTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#efe6d7,#d8c19a)] text-sm font-medium text-[#6e6559]">
                          Ảnh banner sẽ hiển thị ở đây
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex rounded-full border border-white/25 bg-[#243446]/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
                          {editingEventId == null ? "DRAFT" : "PREVIEW"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-5 p-6">
                      <div>
                        <h3 className="text-[2rem] font-bold leading-tight text-[#09111f]">{previewTitle}</h3>
                        <p className="mt-3 text-lg leading-relaxed text-[#5f6674]">{previewSummary}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[#6d737f]">
                        <span className="material-symbols-outlined text-[1.4rem] text-[#d0a552]">calendar_month</span>
                        <span className="text-lg">{formatPreviewDateRange(form.startTime, form.endTime)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-[#e3dbcf] bg-[#fbf8f2] p-4 text-sm text-[#6e6559]">
                    <p><strong>Banner URL</strong>: ảnh lớn ở đầu card và trang chi tiết.</p>
                    <p className="mt-2"><strong>Tiêu đề</strong>: lấy từ trường `Tên sự kiện`.</p>
                    <p className="mt-2"><strong>Tóm tắt</strong>: lấy từ trường `Tóm tắt nội dung sự kiện`.</p>
                    <p className="mt-2"><strong>Thời gian</strong>: lấy từ `Bắt đầu` và `Kết thúc`.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
