"use client";

import { useState } from "react";

type DocStatus = "not_uploaded" | "uploaded" | "verified";

const STATUS_LABEL: Record<DocStatus, string> = {
  not_uploaded: "Chưa tải lên",
  uploaded: "Đã tải lên",
  verified: "Đã xác minh",
};

const STATUS_CLASS: Record<DocStatus, string> = {
  not_uploaded: "bg-white/10 text-white/50",
  uploaded: "bg-yellow-500/10 text-yellow-300",
  verified: "bg-green-500/10 text-green-300",
};

function UploadZone({
  title,
  status,
  onUpload,
  onRemove,
}: {
  title: string;
  status: DocStatus;
  onUpload: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-semibold ${STATUS_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {status === "not_uploaded" ? (
        <button
          type="button"
          onClick={onUpload}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-10 text-center hover:border-[var(--luxora-gold)]"
        >
          <span className="material-symbols-outlined text-3xl text-white/30">
            cloud_upload
          </span>
          <p className="text-sm text-white/50">
            Kéo thả tài liệu vào đây hoặc bấm để chọn file
          </p>
        </button>
      ) : (
        <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[var(--luxora-gold)]">
              description
            </span>
            <span className="text-sm">document.pdf</span>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-white/40 hover:text-red-300"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function KycClient() {
  const [idStatus, setIdStatus] = useState<DocStatus>("not_uploaded");
  const [addressStatus, setAddressStatus] = useState<DocStatus>("not_uploaded");

  const completed = [idStatus, addressStatus].filter((s) => s !== "not_uploaded").length;
  const canSubmit = idStatus !== "not_uploaded" && addressStatus !== "not_uploaded";

  function fakeUpload(setStatus: (s: DocStatus) => void) {
    setStatus("uploaded");
    setTimeout(() => setStatus("verified"), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-display-lg text-3xl">Xác minh danh tính</h1>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs text-white/50">
          <span>Tiến độ</span>
          <span>{completed}/2 Hoàn tất</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-[var(--luxora-gold)] transition-all"
            style={{ width: `${(completed / 2) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5">
        <UploadZone
          title="Giấy tờ tùy thân"
          status={idStatus}
          onUpload={() => fakeUpload(setIdStatus)}
          onRemove={() => setIdStatus("not_uploaded")}
        />
        <UploadZone
          title="Chứng minh địa chỉ"
          status={addressStatus}
          onUpload={() => fakeUpload(setAddressStatus)}
          onRemove={() => setAddressStatus("not_uploaded")}
        />
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        className="gradient-cta mt-8 w-full rounded-full py-3.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        Gửi để xác minh
      </button>
    </div>
  );
}
