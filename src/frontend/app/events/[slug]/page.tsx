import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import EventParticipation from "./EventParticipation";
import { API_BASE_URL } from "@/lib/api-base";

type EventDetail = {
  eventId: number;
  name: string;
  slug: string;
  description: string | null;
  bannerUrl: string | null;
  status: string;
  registrationOpenAt: string | null;
  registrationDeadline: string | null;
  startTime: string;
  endTime: string;
  rulesText: string | null;
  rewardDescription: string | null;
  isCharity: boolean;
  charityPercent?: number | null;
  biddingMode: string;
  moneyMode?: "REAL" | "VIRTUAL";
  depositAmount?: number | null;
};

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

async function loadEventBySlug(slug: string): Promise<EventDetail | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/slug/${slug}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    const body = (await response.json()) as ApiEnvelope<EventDetail>;
    return body.data ?? null;
  } catch {
    return null;
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

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await loadEventBySlug(params.slug);
  if (!event) {
    notFound();
  }

  return (
    <div className="luxora-app min-h-screen bg-black text-white">
      <Header />
      <main className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 lg:px-12">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-xs text-white/50">
          <Link href="/events" className="hover:text-[#f0c982]">
            Sự kiện
          </Link>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-white/70">{event.name}</span>
        </div>

        {/* Banner */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-white/10">
          <div className="relative h-64 overflow-hidden sm:h-80">
            <Image
              src={event.bannerUrl || "/product-placeholder.svg"}
              alt={event.name}
              fill
              sizes="(min-width: 1280px) 1200px, 100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                  statusColors[event.status as keyof typeof statusColors] ?? "bg-white/10 text-white border-white/20"
                }`}
              >
                {event.status}
              </span>
              <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
                {event.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Description */}
            <section className="rounded-2xl border border-white/10 bg-[#070707] p-6 sm:p-8">
              <h2 className="text-xl font-bold">Mô tả</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {event.description || "Sự kiện này chưa cập nhật mô tả."}
              </p>
            </section>

            {/* Rules */}
            <section className="rounded-2xl border border-white/10 bg-[#070707] p-6 sm:p-8">
              <h2 className="text-xl font-bold">Quy tắc</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {event.rulesText || "Chưa có thể lệ chi tiết."}
              </p>
            </section>

            {/* Rewards */}
            <section className="rounded-2xl border border-white/10 bg-[#070707] p-6 sm:p-8">
              <h2 className="text-xl font-bold">Phần thưởng</h2>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                {event.rewardDescription || "Chưa có mô tả phần thưởng."}
              </p>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Info */}
            <div className="rounded-2xl border border-white/10 bg-[#070707] p-6">
              <h3 className="text-lg font-bold">Thông tin sự kiện</h3>
              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-white/50">
                    Định dạng
                  </span>
                  <span className="text-sm font-semibold text-[#f0c982]">
                    {event.biddingMode}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wide text-white/50">
                    Từ thiện
                  </span>
                  <span className="text-sm font-semibold">
                    {event.isCharity ? `Có (${event.charityPercent}%)` : "Không"}
                  </span>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#f0c982]">
                      schedule
                    </span>
                    <div>
                      <p className="text-xs text-white/50">Thời gian đăng ký</p>
                      <p className="text-sm font-medium">
                        {event.registrationOpenAt && event.registrationDeadline
                          ? `${new Date(event.registrationOpenAt).toLocaleDateString("vi-VN")} - ${new Date(event.registrationDeadline).toLocaleDateString("vi-VN")}`
                          : "Chưa cập nhật"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#f0c982]">
                      event
                    </span>
                    <div>
                      <p className="text-xs text-white/50">Thời gian diễn ra</p>
                      <p className="text-sm font-medium">
                        {new Date(event.startTime).toLocaleDateString("vi-VN")} -{" "}
                        {new Date(event.endTime).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive registration + bidding + payment */}
              <div className="mt-6">
                <EventParticipation
                  eventId={event.eventId}
                  status={event.status}
                  moneyMode={event.moneyMode ?? "REAL"}
                  depositAmount={event.depositAmount ?? null}
                  biddingMode={event.biddingMode}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
