"use client";

import { useState } from "react";

type SubmissionStatus = "pending" | "approved" | "rejected" | "info_required";

type Submission = {
  id: string;
  name: string;
  email: string;
  date: string;
  hasGovId: boolean;
  hasProofOfAddress: boolean;
};

const SUBMISSIONS: Submission[] = [
  { id: "1", name: "Trần Văn Đức", email: "duc.tran@luxora.vn", date: "03/07/2026", hasGovId: true, hasProofOfAddress: true },
  { id: "2", name: "Lê Thu Hà", email: "ha.le@luxora.vn", date: "02/07/2026", hasGovId: true, hasProofOfAddress: false },
  { id: "3", name: "Vũ Anh Tuấn", email: "tuan.vu@luxora.vn", date: "01/07/2026", hasGovId: false, hasProofOfAddress: false },
];

const STATUS_LABEL: Record<SubmissionStatus, string> = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  info_required: "Cần bổ sung",
};

const STATUS_CLASS: Record<SubmissionStatus, string> = {
  pending: "bg-yellow-500/10 text-yellow-300",
  approved: "bg-green-500/10 text-green-300",
  rejected: "bg-red-500/10 text-red-300",
  info_required: "bg-blue-500/10 text-blue-300",
};

export default function KycReviewClient() {
  const [selected, setSelected] = useState(SUBMISSIONS[0].id);
  const [statuses, setStatuses] = useState<Record<string, SubmissionStatus>>(
    Object.fromEntries(SUBMISSIONS.map((s) => [s.id, "pending"])),
  );

  const current = SUBMISSIONS.find((s) => s.id === selected)!;

  return (
    <div className="flex h-[calc(100vh-2rem)] m-4 overflow-hidden rounded-3xl border border-white/10">
      <aside className="w-72 shrink-0 overflow-y-auto border-r border-white/10">
        <div className="border-b border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
            Hàng đợi KYC
          </p>
        </div>
        {SUBMISSIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelected(s.id)}
            className={`flex w-full flex-col gap-1 border-b border-white/5 px-4 py-3 text-left transition-colors ${
              selected === s.id ? "bg-white/5" : "hover:bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{s.name}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[statuses[s.id]]}`}
              >
                {STATUS_LABEL[statuses[s.id]]}
              </span>
            </div>
            <p className="text-[11px] text-white/40">{s.date}</p>
          </button>
        ))}
      </aside>

      <div className="flex flex-1 flex-col overflow-y-auto p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
          <div>
            <p className="text-lg font-semibold">{current.name}</p>
            <p className="text-sm text-white/40">
              {current.email} · {current.date}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${STATUS_CLASS[statuses[current.id]]}`}
          >
            {STATUS_LABEL[statuses[current.id]]}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Giấy tờ tùy thân", present: current.hasGovId },
            { label: "Chứng minh địa chỉ", present: current.hasProofOfAddress },
          ].map((doc) => (
            <div key={doc.label} className="glass-panel rounded-2xl p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">{doc.label}</p>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    doc.present
                      ? "bg-green-500/10 text-green-300"
                      : "bg-red-500/10 text-red-300"
                  }`}
                >
                  {doc.present ? "Đã tải lên" : "Thiếu"}
                </span>
              </div>
              {doc.present ? (
                <div className="flex h-32 items-center justify-center rounded-xl bg-white/5 text-white/20">
                  <span className="material-symbols-outlined text-4xl">
                    description
                  </span>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-white/10 text-xs text-white/30">
                  Chưa có tài liệu
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="mb-1.5 block text-xs font-medium text-white/50">
            Ghi chú xét duyệt
          </label>
          <textarea
            rows={3}
            placeholder="Ghi chú xét duyệt..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              setStatuses((prev) => ({ ...prev, [current.id]: "approved" }))
            }
            className="rounded-full bg-green-500/10 px-5 py-2.5 text-sm font-semibold text-green-300 hover:bg-green-500/20"
          >
            Duyệt KYC
          </button>
          <button
            type="button"
            onClick={() =>
              setStatuses((prev) => ({
                ...prev,
                [current.id]: "info_required",
              }))
            }
            className="rounded-full bg-blue-500/10 px-5 py-2.5 text-sm font-semibold text-blue-300 hover:bg-blue-500/20"
          >
            Yêu cầu bổ sung
          </button>
          <button
            type="button"
            onClick={() =>
              setStatuses((prev) => ({ ...prev, [current.id]: "rejected" }))
            }
            className="rounded-full bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/20"
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>
  );
}
