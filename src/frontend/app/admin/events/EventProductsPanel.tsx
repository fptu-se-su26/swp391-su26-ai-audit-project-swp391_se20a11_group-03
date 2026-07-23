"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ApiError,
  adminApi,
  productApi,
  uploadImages,
  type Category,
  type EventProduct,
} from "@/lib/api";

const fieldClass =
  "w-full rounded-xl border border-[#d8d0c4] bg-white px-3 py-2 text-sm outline-none focus:border-[#d4aa61]";

function money(value: number | null) {
  return value == null ? "—" : `${value.toLocaleString("vi-VN")} ₫`;
}

export default function EventProductsPanel({ eventId }: { eventId: number }) {
  const [products, setProducts] = useState<EventProduct[]>([]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    productName: "",
    categoryId: "",
    description: "",
    startingPrice: "",
    stepPrice: "",
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([adminApi.eventProducts(eventId), productApi.categories()])
      .then(([productResult, categoryResult]) => {
        if (cancelled) return;
        setProducts(productResult.data ?? []);
        setCategories(categoryResult.data ?? []);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "Không thể tải sản phẩm"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [eventId]);

  useEffect(() => {
    const ids = [...new Set(products.map((item) => item.productId).filter((id): id is number => id != null))]
      .filter((id) => names[id] == null);
    if (!ids.length) return;
    let cancelled = false;
    Promise.all(ids.map((id) => productApi.detail(id)
      .then((item) => [id, item.productName] as const)
      .catch(() => [id, `Sản phẩm #${id}`] as const)))
      .then((pairs) => {
        if (!cancelled) setNames((current) => ({ ...current, ...Object.fromEntries(pairs) }));
      });
    return () => { cancelled = true; };
  }, [products, names]);

  const pending = useMemo(
    () => products.filter((item) => item.approvalStatus === "PENDING" && item.sessionStatus !== "CANCELLED"),
    [products],
  );
  const approved = useMemo(
    () => products.filter((item) => item.approvalStatus === "APPROVED" && item.sessionStatus !== "CANCELLED"),
    [products],
  );

  async function review(id: number, approve: boolean) {
    let reason = "";
    if (!approve) {
      reason = window.prompt("Nhập lý do từ chối sản phẩm:")?.trim() ?? "";
      if (!reason) return;
    }
    setBusyId(id);
    setError(null);
    try {
      const result = approve
        ? await adminApi.approveEventProduct(id)
        : await adminApi.rejectEventProduct(id, reason);
      setProducts((current) => current.map((item) => item.eventProductId === id ? result.data : item));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Không thể duyệt sản phẩm");
    } finally {
      setBusyId(null);
    }
  }

  async function addFromComputer() {
    if (!files.length || !draft.productName.trim() || !draft.categoryId
      || !draft.startingPrice || !draft.stepPrice) return;
    setAdding(true);
    setError(null);
    try {
      const urls = await uploadImages(files);
      const result = await adminApi.createEventProductFromComputer(eventId, {
        categoryId: Number(draft.categoryId),
        productName: draft.productName.trim(),
        description: draft.description.trim(),
        startingPrice: Number(draft.startingPrice),
        stepPrice: Number(draft.stepPrice),
        images: urls.map((imageUrl, index) => ({ imageUrl, isPrimary: index === 0 })),
      });
      setProducts((current) => [...current, result.data]);
      if (result.data.productId) {
        setNames((current) => ({ ...current, [result.data.productId!]: draft.productName.trim() }));
      }
      setFiles([]);
      setDraft({ productName: "", categoryId: "", description: "", startingPrice: "", stepPrice: "" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể thêm sản phẩm từ máy");
    } finally {
      setAdding(false);
    }
  }

  async function moveProduct(targetId: number) {
    if (draggedId == null || draggedId === targetId) return;
    const from = approved.findIndex((item) => item.eventProductId === draggedId);
    const to = approved.findIndex((item) => item.eventProductId === targetId);
    if (from < 0 || to < 0) return;
    const next = [...approved];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setProducts((current) => [
      ...current.filter((item) => item.approvalStatus !== "APPROVED" || item.sessionStatus === "CANCELLED"),
      ...next,
    ]);
    setDraggedId(null);
    setSavingOrder(true);
    try {
      await adminApi.reorderEventProducts(eventId, next.map((item) => item.eventProductId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không thể lưu thứ tự sản phẩm");
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
      <section className="rounded-2xl border border-[#ddd4c8] bg-[#fcfaf6] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57a2a]">
          Sản phẩm seller gửi chờ duyệt
        </p>
        <p className="mt-2 text-xs text-[#7b7268]">
          Chỉ sản phẩm seller chủ động gửi vào sự kiện mới xuất hiện tại đây.
        </p>
        {loading && <p className="mt-4 text-sm text-[#7b7268]">Đang tải...</p>}
        {!loading && pending.length === 0 && (
          <div className="mt-4 rounded-xl border border-dashed border-[#d8d0c4] px-4 py-8 text-center text-sm text-[#7b7268]">
            Hiện chưa có seller nào gửi sản phẩm để duyệt.
          </div>
        )}
        <div className="mt-4 space-y-2">
          {pending.map((item) => (
            <div key={item.eventProductId} className="rounded-xl border border-[#e3dbcf] bg-white p-3">
              <p className="font-semibold">{item.productId ? names[item.productId] ?? `Sản phẩm #${item.productId}` : "Sản phẩm mới"}</p>
              <p className="mt-1 text-xs text-[#7b7268]">Seller #{item.submittedBySellerId} · Giá khởi điểm {money(item.startingPrice)}</p>
              <div className="mt-3 flex gap-2">
                <button disabled={busyId === item.eventProductId} onClick={() => void review(item.eventProductId, true)}
                  className="rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40">Duyệt</button>
                <button disabled={busyId === item.eventProductId} onClick={() => void review(item.eventProductId, false)}
                  className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 disabled:opacity-40">Từ chối</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        <section className="rounded-2xl border border-[#ddd4c8] bg-[#fcfaf6] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57a2a]">Thêm sản phẩm từ máy</p>
          <div className="mt-3 space-y-2">
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#c8bba8] bg-white px-4 py-4 text-sm font-semibold text-[#765a2d]">
              <input type="file" accept="image/*" multiple className="hidden"
                onChange={(event) => setFiles(Array.from(event.target.files ?? []))} />
              {files.length ? `Đã chọn ${files.length} ảnh` : "Chọn ảnh sản phẩm từ folder"}
            </label>
            <input className={fieldClass} placeholder="Tên sản phẩm" value={draft.productName}
              onChange={(event) => setDraft({ ...draft, productName: event.target.value })} />
            <select className={fieldClass} value={draft.categoryId}
              onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
              <option value="">Chọn danh mục</option>
              {categories.map((item) => <option key={item.categoryId} value={item.categoryId}>{item.categoryName}</option>)}
            </select>
            <textarea className={fieldClass} placeholder="Mô tả sản phẩm" value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min="1" className={fieldClass} placeholder="Giá khởi điểm" value={draft.startingPrice}
                onChange={(event) => setDraft({ ...draft, startingPrice: event.target.value })} />
              <input type="number" min="1" className={fieldClass} placeholder="Bước giá" value={draft.stepPrice}
                onChange={(event) => setDraft({ ...draft, stepPrice: event.target.value })} />
            </div>
            <button type="button" disabled={adding || !files.length || !draft.productName || !draft.categoryId || !draft.startingPrice || !draft.stepPrice}
              onClick={() => void addFromComputer()}
              className="w-full rounded-full bg-[#f0c982] py-2.5 text-sm font-semibold text-black disabled:opacity-40">
              {adding ? "Đang tải lên..." : "Thêm vào buổi đấu giá"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-[#ddd4c8] bg-[#fcfaf6] p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a57a2a]">Thứ tự đấu giá</p>
            {savingOrder && <span className="text-xs text-[#7b7268]">Đang lưu...</span>}
          </div>
          <p className="mt-2 text-xs text-[#7b7268]">Kéo và thả để đổi thứ tự sản phẩm.</p>
          {!loading && approved.length === 0 && <p className="mt-4 text-sm text-[#7b7268]">Chưa có sản phẩm đã duyệt.</p>}
          <div className="mt-3 space-y-2">
            {approved.map((item, index) => (
              <div key={item.eventProductId} draggable
                onDragStart={() => setDraggedId(item.eventProductId)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => void moveProduct(item.eventProductId)}
                className="flex cursor-grab items-center gap-3 rounded-xl border border-[#e3dbcf] bg-white p-3 active:cursor-grabbing">
                <span className="material-symbols-outlined text-[#a57a2a]">drag_indicator</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3e5c8] text-xs font-bold">{index + 1}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.productId ? names[item.productId] ?? `Sản phẩm #${item.productId}` : "Sản phẩm"}</p>
                  <p className="text-xs text-[#7b7268]">{money(item.startingPrice)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
