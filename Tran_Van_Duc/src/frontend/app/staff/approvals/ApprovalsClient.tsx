"use client";

import { useState } from "react";
import { mockStaffApprovals, type StaffApproval } from "@/lib/mock-data";

const STATUS_LABEL: Record<StaffApproval["status"], string> = {
  pending: "Chờ duyệt",
  reviewing: "Đang xem xét",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

const STATUS_CLASS: Record<StaffApproval["status"], string> = {
  pending: "bg-yellow-500/10 text-yellow-300",
  reviewing: "bg-blue-500/10 text-blue-300",
  approved: "bg-green-500/10 text-green-300",
  rejected: "bg-red-500/10 text-red-300",
};

export default function ApprovalsClient() {
  const [items, setItems] = useState<StaffApproval[]>(mockStaffApprovals);

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const reviewingCount = items.filter((i) => i.status === "reviewing").length;
  const approvedCount = items.filter((i) => i.status === "approved").length;

  function updateStatus(id: string, status: StaffApproval["status"]) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item)),
    );
  }

  const priorityItem = items[0];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="font-display-lg text-3xl">Bàn duyệt vật phẩm</h1>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-xs text-white/40">Chờ duyệt</p>
          <p className="mt-2 text-2xl font-bold text-yellow-300">
            {pendingCount}
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-xs text-white/40">Đang xem xét</p>
          <p className="mt-2 text-2xl font-bold text-blue-300">
            {reviewingCount}
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-6">
          <p className="text-xs text-white/40">Đã duyệt hôm nay</p>
          <p className="mt-2 text-2xl font-bold text-green-300">
            {approvedCount}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="glass-panel rounded-2xl p-6 lg:col-span-1">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/40">
            Hồ sơ ưu tiên
          </p>
          <p className="text-sm font-semibold">{priorityItem.title}</p>
          <p className="mt-1 text-xs text-white/40">{priorityItem.seller}</p>
          <p className="mt-3 text-xs text-white/50">{priorityItem.category}</p>
          <p className="mt-1 text-lg font-bold text-[var(--luxora-gold-light)]">
            ${priorityItem.estimatedValue.toLocaleString("en-US")}
          </p>
        </aside>

        <div className="lg:col-span-3">
          <h2 className="font-headline-md mb-4 text-lg">
            Danh sách chờ xử lý
          </h2>
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="glass-card flex flex-wrap items-center gap-4 rounded-2xl p-4"
              >
                <div className="min-w-[220px] flex-1">
                  <p className="text-[10px] text-white/40">
                    {item.category} · {item.submitted}
                  </p>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-white/40">{item.seller}</p>
                </div>
                <p className="font-semibold text-[var(--luxora-gold-light)]">
                  ${item.estimatedValue.toLocaleString("en-US")}
                </p>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_CLASS[item.status]}`}
                >
                  {STATUS_LABEL[item.status]}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "approved")}
                    className="rounded-full bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-300 hover:bg-green-500/20"
                  >
                    Duyệt
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "reviewing")}
                    className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20"
                  >
                    Xem xét
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(item.id, "rejected")}
                    className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/20"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
