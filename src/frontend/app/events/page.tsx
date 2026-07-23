import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { API_BASE_URL } from "@/lib/api-base";

type EventItem = {
  eventId: number;
  name: string;
  slug: string;
  description: string | null;
  bannerUrl: string | null;
  status: string;
  startTime: string;
  endTime: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function loadEvents(): Promise<EventItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/events`, { cache: "no-store" });
    if (!response.ok) return [];
    const body = (await response.json()) as ApiEnvelope<EventItem[]>;
    return body.data ?? [];
  } catch {
    return [];
  }
}

// Status badge colors
const statusColors = {
  DRAFT: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  PUBLISHED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ONGOING: "bg-green-500/20 text-green-400 border-green-500/30",
  ENDED: "bg-red-500/20 text-red-400 border-red-500/30",
  CANCELLED: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  ARCHIVED: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

export default async function EventsPage() {
  const events = await loadEvents();

  return (
    <div className="luxora-app min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-12">
        {/* Hero */}
        <section className="mb-12">
          <div className="themed-feature-panel rounded-2xl border border-[#d7aa63]/35 p-6 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#f0c982]">
              SỰ KIỆN ĐẤU GIÁ
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">
              Khám phá các sự kiện đấu giá đặc biệt
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-white/62">
              Tham gia các sự kiện đấu giá với nhiều định dạng và phần thưởng hấp dẫn
            </p>
          </div>
        </section>

        {/* Events Grid */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {events.map((event) => (
            <Link
              key={event.eventId}
              href={`/events/${event.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-[#070707] transition-all hover:-translate-y-1 hover:border-[#f0c982]/60"
            >
              {/* Banner */}
              <div className="relative h-48 overflow-hidden sm:h-56">
                {/* Admin có thể nhập URL từ bất kỳ máy chủ ảnh nào. Dùng img
                    để URL đó không bị giới hạn bởi next/image remotePatterns. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.bannerUrl || "/product-placeholder.svg"}
                  alt={event.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                      statusColors[event.status as keyof typeof statusColors] ?? "bg-white/10 text-white border-white/20"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                <h2 className="text-xl font-bold leading-tight">{event.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/60">
                  {event.description || "Sự kiện đấu giá mới được tạo trên hệ thống."}
                </p>

                {/* Dates */}
                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/50">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base text-[#f0c982]">
                      event
                    </span>
                    <span>
                      {new Date(event.startTime).toLocaleDateString("vi-VN")} -{" "}
                      {new Date(event.endTime).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-white/40 transition-colors group-hover:text-[#f0c982]">
                    Xem chi tiết
                  </span>
                  <span className="material-symbols-outlined text-base text-[#f0c982]">
                    arrow_forward
                  </span>
                </div>
              </div>
            </Link>
          ))}
          {events.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#070707] p-10 text-center text-white/60 lg:col-span-2">
              Chưa có sự kiện nào để hiển thị.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
