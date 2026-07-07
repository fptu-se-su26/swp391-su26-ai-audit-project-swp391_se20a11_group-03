import Image from "next/image";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { HERO_STATS, WHY_CHOOSE_FEATURES } from "@/lib/home-data";

const TIMELINE = [
  {
    year: "2024",
    title: "Ra mắt nền tảng BidZone",
    text: "Xây dựng trải nghiệm đấu giá trực tuyến dành cho sản phẩm cao cấp.",
  },
  {
    year: "2025",
    title: "Chuẩn hóa quy trình kiểm định",
    text: "Kết hợp chuyên gia, hồ sơ giấy tờ và lịch sử giao dịch để xác thực lot.",
  },
  {
    year: "2026",
    title: "Mở rộng cộng đồng sưu tầm",
    text: "Kết nối người mua, người ký gửi và đội ngũ vận hành trên toàn quốc.",
  },
];

const OPERATIONS = [
  "Tiếp nhận và phân loại vật phẩm ký gửi",
  "Kiểm định tình trạng, nguồn gốc và giấy tờ",
  "Niêm yết minh bạch với ảnh, mô tả và giá tham chiếu",
  "Bảo chứng thanh toán, bàn giao và hỗ trợ sau phiên",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <section className="relative overflow-hidden border-b border-white/10">
          <Image
            src="/images/luxury-watch-hero.png"
            alt="BidZone luxury auction house"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[72%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/30" />
          <div className="relative mx-auto grid max-w-[1600px] gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#f0c982]">
                Về BidZone
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-6xl">
                Nơi giá trị được kiểm định, bảo chứng và tôn vinh
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/64">
                BidZone không chỉ tạo một sàn giao dịch. Chúng tôi xây dựng một
                môi trường đấu giá có kiểm định, có bảo chứng và có trải nghiệm
                xứng tầm với giá trị của từng vật phẩm.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 self-end">
              {HERO_STATS.map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-xl border border-white/10 bg-black/45 p-5 backdrop-blur"
                >
                  <p className="text-3xl font-bold text-[#f0c982]">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-white/55">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1600px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-12">
          <div className="rounded-2xl border border-[#d7aa63]/30 bg-[radial-gradient(circle_at_20%_20%,rgba(240,201,130,0.12),transparent_35%),#050505] p-6 sm:p-8">
            <p className="text-sm font-semibold tracking-[0.25em] text-[#f0c982]">
              MÔ HÌNH VẬN HÀNH
            </p>
            <h2 className="mt-4 text-3xl font-bold">
              Đấu giá không chỉ là giá, mà là niềm tin.
            </h2>
            <div className="mt-8 space-y-4">
              {OPERATIONS.map((item, index) => (
                <div key={item} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d7aa63]/40 text-sm font-bold text-[#f0c982]">
                    {index + 1}
                  </span>
                  <p className="pt-2 text-sm leading-relaxed text-white/65">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_CHOOSE_FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="rounded-2xl border border-white/10 bg-[#070707] p-6"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d7aa63]/35 bg-[#f0c982]/10">
                  <span className="material-symbols-outlined text-2xl text-[#f0c982]">
                    {feature.icon}
                  </span>
                </span>
                <h3 className="mt-5 text-sm font-bold tracking-wider">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/10">
          <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-12">
            <p className="text-sm font-semibold tracking-[0.25em] text-[#f0c982]">
              HÀNH TRÌNH PHÁT TRIỂN
            </p>
            <div className="mt-8 grid gap-5 lg:grid-cols-3">
              {TIMELINE.map((item) => (
                <div
                  key={item.year}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
                >
                  <p className="text-3xl font-bold text-[#f0c982]">
                    {item.year}
                  </p>
                  <h3 className="mt-5 text-lg font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
