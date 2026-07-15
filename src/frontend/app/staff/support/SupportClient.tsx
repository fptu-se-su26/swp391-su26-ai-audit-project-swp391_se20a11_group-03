"use client";

import { useState } from "react";

type Priority = "high" | "medium" | "low";
type Status = "open" | "pending" | "resolved";

type Ticket = {
  id: string;
  name: string;
  subject: string;
  unread: boolean;
  priority: Priority;
  status: Status;
  date: string;
};

const TICKETS: Ticket[] = [
  { id: "1", name: "Ngô Thanh Trúc", subject: "Khiếu nại hoàn cọc Lot #42", unread: true, priority: "high", status: "open", date: "03/07/2026" },
  { id: "2", name: "Phạm Quốc Bảo", subject: "Không nhận được hóa đơn", unread: false, priority: "medium", status: "pending", date: "02/07/2026" },
  { id: "3", name: "Đặng Gia Huy", subject: "Câu hỏi về phí ký gửi", unread: false, priority: "low", status: "resolved", date: "30/06/2026" },
  { id: "4", name: "Lê Thu Hà", subject: "Yêu cầu hủy đấu giá", unread: true, priority: "high", status: "open", date: "29/06/2026" },
];

const PRIORITY_CLASS: Record<Priority, string> = {
  high: "bg-red-500/10 text-red-300",
  medium: "bg-yellow-500/10 text-yellow-300",
  low: "bg-white/10 text-white/50",
};

const STATUS_CLASS: Record<Status, string> = {
  open: "bg-blue-500/10 text-blue-300",
  pending: "bg-yellow-500/10 text-yellow-300",
  resolved: "bg-green-500/10 text-green-300",
};

const PRIORITY_LABEL: Record<Priority, string> = {
  high: "Cao",
  medium: "Trung bình",
  low: "Thấp",
};

const STATUS_LABEL: Record<Status, string> = {
  open: "Đang mở",
  pending: "Đang chờ",
  resolved: "Đã xử lý",
};

export default function SupportClient() {
  const [selectedId, setSelectedId] = useState(TICKETS[0].id);
  const [reply, setReply] = useState("");

  const ticket = TICKETS.find((t) => t.id === selectedId)!;

  return (
    <div className="flex h-[calc(100vh-2rem)] m-4 overflow-hidden rounded-3xl border border-white/10">
      <aside className="w-80 shrink-0 overflow-y-auto border-r border-white/10">
        <div className="border-b border-white/10 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
            Hộp thư hỗ trợ
          </p>
          <input
            type="text"
            placeholder="Tìm kiếm ticket..."
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
        </div>
        {TICKETS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelectedId(t.id)}
            className={`flex w-full flex-col gap-1.5 border-b border-white/5 px-4 py-3 text-left transition-colors ${
              selectedId === t.id ? "bg-white/5" : "hover:bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{t.name}</p>
              {t.unread && (
                <span className="h-2 w-2 rounded-full bg-[var(--luxora-gold)]" />
              )}
            </div>
            <p className="truncate text-xs text-white/50">{t.subject}</p>
            <div className="flex gap-1.5">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_CLASS[t.priority]}`}
              >
                {PRIORITY_LABEL[t.priority]}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[t.status]}`}
              >
                {STATUS_LABEL[t.status]}
              </span>
            </div>
          </button>
        ))}
      </aside>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-sm font-semibold">{ticket.subject}</p>
            <p className="text-xs text-white/40">
              {ticket.name} · {ticket.date} · Mức độ: {PRIORITY_LABEL[ticket.priority]}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300 hover:bg-green-500/20"
            >
              Đánh dấu đã xử lý
            </button>
            <button
              type="button"
              className="text-white/40 hover:text-white"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <div className="max-w-md rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-white/80">
            Tôi đã đấu giá thắng Lot #42 nhưng chưa nhận được hoàn cọc sau khi
            hủy giao dịch. Vui lòng kiểm tra giúp tôi.
          </div>
          <div className="ml-auto max-w-md rounded-2xl bg-[var(--luxora-gold)] px-4 py-2.5 text-sm text-black">
            Chào bạn, chúng tôi đã ghi nhận yêu cầu và đang xử lý hoàn cọc
            trong vòng 3-5 ngày làm việc.
          </div>
        </div>

        <div className="border-t border-white/10 p-4">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            placeholder="Nhập phản hồi..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-[var(--luxora-gold)]"
          />
          <button
            type="button"
            onClick={() => setReply("")}
            className="gradient-cta mt-3 rounded-full px-6 py-2.5 text-sm font-semibold text-black"
          >
            Trả lời
          </button>
        </div>
      </div>
    </div>
  );
}
