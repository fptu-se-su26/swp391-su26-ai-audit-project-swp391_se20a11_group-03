import Link from "next/link";
import { Playfair_Display } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["vietnamese"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const navItems = ["Đấu giá", "Danh mục", "Bộ sưu tập", "Tin tức", "Về chúng tôi"];

const stats = [
  { icon: "gavel", value: "10,000+", label: "Vật phẩm đấu giá" },
  { icon: "groups", value: "50,000+", label: "Thành viên" },
  { icon: "emoji_events", value: "98%", label: "Tỷ lệ đấu giá thành công" },
  { icon: "verified_user", value: "100%", label: "Minh bạch & An toàn" },
];

const categories = [
  { icon: "diamond", title: "Trang sức", count: "1,234+ vật phẩm" },
  { icon: "watch", title: "Đồng hồ", count: "2,345+ vật phẩm" },
  { icon: "shopping_bag", title: "Túi xách", count: "1,876+ vật phẩm" },
  { icon: "wine_bar", title: "Rượu vang", count: "987+ vật phẩm" },
  { icon: "crop_original", title: "Nghệ thuật", count: "1,543+ vật phẩm" },
  { icon: "workspace_premium", title: "Sưu tầm hiếm", count: "2,015+ vật phẩm" },
];

const auctions = [
  {
    title: "Kim cương Eternal Crown",
    category: "Trang sức",
    bid: "$245,000",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Hermes Birkin Himalaya",
    category: "Túi xách",
    bid: "$185,000",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Chân dung danh họa cổ",
    category: "Nghệ thuật",
    bid: "$720,000",
    image: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=900&auto=format&fit=crop",
  },
];

const premiumLots = [
  {
    category: "Đồng hồ",
    title: "Patek Philippe Grand Complication",
    price: "$2,850,000",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=900&auto=format&fit=crop",
  },
  {
    category: "Trang sức",
    title: "The Imperial Diamond Set",
    price: "$1,950,000",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=900&auto=format&fit=crop",
  },
  {
    category: "Nghệ thuật",
    title: "Abstract Masters Collection",
    price: "$720,000",
    image: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=900&auto=format&fit=crop",
  },
  {
    category: "Rượu vang",
    title: "Bordeaux Private Cellar 1982",
    price: "$168,000",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=900&auto=format&fit=crop",
  },
];

const processSteps = [
  {
    icon: "person_add",
    title: "Tạo tài khoản",
    text: "Xác minh hồ sơ nhanh chóng để tham gia các phiên đấu giá cao cấp.",
  },
  {
    icon: "fact_check",
    title: "Chọn vật phẩm",
    text: "Duyệt danh mục được thẩm định bởi chuyên gia và lưu lot yêu thích.",
  },
  {
    icon: "gavel",
    title: "Đặt giá an toàn",
    text: "Theo dõi thời gian thực, đặt giá minh bạch và nhận thông báo tức thì.",
  },
  {
    icon: "local_shipping",
    title: "Nhận bàn giao",
    text: "Luxora hỗ trợ thanh toán, chứng nhận và vận chuyển bảo hiểm toàn trình.",
  },
];

const trustItems = [
  { value: "24/7", label: "Hỗ trợ khách hàng riêng" },
  { value: "100%", label: "Vật phẩm được thẩm định" },
  { value: "72h", label: "Xử lý bàn giao sau đấu giá" },
];

const journalPosts = [
  {
    title: "Cách đọc giá trị một chiếc đồng hồ hiếm",
    date: "12.07.2026",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Nghệ thuật bảo quản trang sức cao cấp",
    date: "09.07.2026",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=900&auto=format&fit=crop",
  },
  {
    title: "Xu hướng sưu tầm rượu vang châu Âu",
    date: "04.07.2026",
    image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=900&auto=format&fit=crop",
  },
];

const footerColumns = [
  { title: "Danh mục", links: ["Đồng hồ", "Trang sức", "Túi xách", "Rượu vang", "Nghệ thuật"] },
  { title: "Dịch vụ", links: ["Đấu giá trực tiếp", "Thẩm định vật phẩm", "Ký gửi tài sản", "Tư vấn sưu tầm"] },
  { title: "Hỗ trợ", links: ["Hướng dẫn đấu giá", "Chính sách bảo mật", "Điều khoản sử dụng", "Liên hệ"] },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-4" aria-label="Luxora Auction House">
      <span className={`${playfair.className} text-4xl font-semibold leading-none tracking-[-0.08em] text-[#ddb76a]`}>LA</span>
      <span className="leading-none">
        <span className={`${playfair.className} block text-[22px] font-semibold tracking-[0.34em] text-[#f5ead9]`}>LUXORA</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.42em] text-[#c7b79c]">Auction House</span>
      </span>
    </Link>
  );
}

function GoldButton({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center justify-center gap-3 rounded bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-7 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#100d08] shadow-[0_14px_40px_rgba(201,154,75,0.22)] transition hover:brightness-110"
    >
      {children}
    </Link>
  );
}

function OutlineButton({ children, href = "#" }: { children: React.ReactNode; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center justify-center gap-3 rounded border border-[#d4aa61]/70 px-7 py-3 text-xs font-extrabold uppercase tracking-[0.14em] text-[#f0ce88] transition hover:bg-[#d4aa61]/10"
    >
      {children}
    </Link>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4aa61]">{children}</p>
      <span className="mt-3 block h-px w-40 bg-gradient-to-r from-[#d4aa61] to-transparent" />
    </div>
  );
}

export default function LuxeLandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070706] text-[#f5ead9]">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#060606]/88 px-5 backdrop-blur-xl md:px-12">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between gap-6">
          <Logo />
          <div className="hidden h-full items-center gap-10 lg:flex">
            {navItems.map((item, index) => (
              <Link
                key={item}
                href="#"
                className={`flex h-full items-center border-b-2 px-1 text-sm font-semibold uppercase tracking-[0.12em] transition ${
                  index === 0 ? "border-[#d4aa61] text-white" : "border-transparent text-[#e6ded2] hover:text-[#d4aa61]"
                }`}
              >
                {item}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden text-white md:inline-flex" aria-label="Tìm kiếm">
              <span className="material-symbols-outlined text-3xl">search</span>
            </button>
            <button className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white md:inline-flex">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-[#c62828] text-[9px]">★</span>
              VI
              <span className="material-symbols-outlined text-base">expand_more</span>
            </button>
            <OutlineButton href="/auth">Đăng nhập</OutlineButton>
            <Link
              href="/auth/onboarding"
              className="hidden min-h-12 items-center rounded bg-gradient-to-r from-[#f0ce88] to-[#c99a4b] px-7 text-xs font-extrabold uppercase tracking-[0.14em] text-[#100d08] transition hover:brightness-110 md:inline-flex"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>

      <header className="relative min-h-[760px] border-b border-white/10 px-5 pb-28 pt-28 md:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_32%,rgba(212,170,97,0.22),transparent_30%),linear-gradient(90deg,#070706_0%,rgba(7,7,6,0.9)_38%,rgba(7,7,6,0.22)_68%,#070706_100%)]" />
        <div className="absolute inset-y-20 right-0 hidden w-[58%] bg-[url('https://images.unsplash.com/photo-1639006570490-79c0c53f1080?q=80&w=1500&auto=format&fit=crop')] bg-cover bg-center opacity-90 mix-blend-screen lg:block" />
        <div className="absolute inset-y-20 right-0 hidden w-[58%] bg-gradient-to-r from-[#070706] via-transparent to-[#070706]/60 lg:block" />
        <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-t from-[#17130d] to-transparent" />

        <div className="relative z-10 mx-auto grid max-w-[1500px] grid-cols-1 gap-8 lg:grid-cols-[1fr_0.9fr_70px]">
          <div className="pt-16 lg:pt-28">
            <Eyebrow>Sàn đấu giá hàng đầu Việt Nam</Eyebrow>
            <h1 className={`${playfair.className} max-w-[680px] text-[54px] font-medium uppercase leading-[1.08] text-white md:text-[88px] xl:text-[96px]`}>
              Nơi giá trị <span className="block bg-gradient-to-r from-[#e7c57c] to-[#9f722d] bg-clip-text text-transparent">được tôn vinh</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#b7aea3]">
              Luxora Auction House mang đến trải nghiệm đấu giá đẳng cấp, minh bạch và chuyên nghiệp cho những giá trị xứng tầm.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-7">
              <GoldButton href="/storefront">
                Khám phá ngay <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
              </GoldButton>
              <OutlineButton>
                <span className="material-symbols-outlined text-base">play_arrow</span>
                Xem video
              </OutlineButton>
            </div>

            <div className="mt-12 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-4 border-r border-white/10 last:border-r-0">
                  <span className="material-symbols-outlined text-3xl text-[#d4aa61]">{stat.icon}</span>
                  <div>
                    <strong className={`${playfair.className} block text-2xl font-medium text-[#efcf88]`}>{stat.value}</strong>
                    <p className="text-sm text-[#b7aea3]">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[560px] lg:block">
            <div className="absolute bottom-0 right-0 h-32 w-[620px] rounded-[50%] bg-black/50 blur-xl" />
            <div className="absolute bottom-3 right-4 h-28 w-[560px] rounded-t-[50%] border border-white/10 bg-gradient-to-b from-[#211b14] to-[#080807]" />
          </div>

          <aside className="hidden items-center justify-center lg:flex">
            <div className="space-y-7 text-center text-lg text-[#cfc6ba]">
              {["01", "02", "03", "04"].map((slide, index) => (
                <div key={slide} className={index === 0 ? "text-[#d4aa61]" : ""}>
                  <span className="block">{slide}</span>
                  {index === 0 && <span className="mx-auto mt-3 block h-7 w-px bg-[#d4aa61]" />}
                </div>
              ))}
            </div>
          </aside>
        </div>

        <div className="relative z-10 mx-auto mt-12 max-w-[1500px] rounded-lg border border-white/10 bg-[#0b0b0a]/82 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur">
          <div className="grid grid-cols-2 gap-y-8 md:grid-cols-3 xl:grid-cols-6">
            {categories.map((category) => (
              <Link
                href="/storefront"
                key={category.title}
                className="flex min-h-28 flex-col items-center justify-center border-white/10 text-center transition hover:text-[#d4aa61] md:border-r md:last:border-r-0"
              >
                <span className="material-symbols-outlined mb-4 text-4xl text-[#d4aa61]">{category.icon}</span>
                <strong className={`${playfair.className} text-lg font-semibold uppercase tracking-[0.12em] text-white`}>{category.title}</strong>
                <span className="mt-2 text-sm text-[#b7aea3]">{category.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute bottom-36 right-12 z-20 hidden gap-4 lg:flex">
          <button className="grid h-12 w-12 place-items-center rounded-full border border-white/10 text-white/80" aria-label="Slide trước">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="grid h-12 w-12 place-items-center rounded-full bg-[#d9ae61] text-[#120e08]" aria-label="Slide sau">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </header>

      <section className="bg-[radial-gradient(circle_at_12%_10%,rgba(212,170,97,0.14),transparent_28%),#11100d] px-5 py-16 md:px-12">
        <div className="mx-auto grid max-w-[1500px] gap-10 lg:grid-cols-[360px_1fr]">
          <div>
            <Eyebrow>Đấu giá sắp diễn ra</Eyebrow>
            <h2 className={`${playfair.className} text-4xl font-medium leading-tight text-white md:text-5xl`}>
              Những phiên đấu giá đáng chú ý
            </h2>
          </div>
          <div>
            <div className="mb-5 flex justify-end">
              <Link href="/storefront" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
                Xem tất cả <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {auctions.map((auction) => (
                <article key={auction.title} className="group overflow-hidden rounded-md border border-white/10 bg-[#090908]">
                  <div className="relative h-64 overflow-hidden">
                    <img src={auction.image} alt={auction.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <span className="absolute left-5 top-5 rounded bg-[#b88a3a]/80 px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white">
                      Sắp diễn ra
                    </span>
                    <div className="absolute right-5 top-5 flex gap-3 text-center text-white">
                      {["02", "15", "30"].map((time, index) => (
                        <div key={index}>
                          <strong className="block text-lg font-semibold tracking-[0.12em]">{time}</strong>
                          <span className="text-[9px] uppercase tracking-[0.12em] text-[#d8d0c6]">{["Giờ", "Phút", "Giây"][index]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#d4aa61]">{auction.category}</p>
                    <h3 className={`${playfair.className} mt-2 text-2xl font-medium text-white`}>{auction.title}</h3>
                    <div className="mt-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-[#9d948a]">Giá khởi điểm</p>
                        <p className="mt-1 text-lg font-semibold text-[#efcf88]">{auction.bid}</p>
                      </div>
                      <Link href="/auctions/1" className="grid h-10 w-10 place-items-center rounded-full border border-[#d4aa61] text-[#d4aa61]" aria-label={`Xem ${auction.title}`}>
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#080807] px-5 py-20 md:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Vật phẩm nổi bật</Eyebrow>
              <h2 className={`${playfair.className} max-w-2xl text-4xl font-medium leading-tight text-white md:text-6xl`}>
                Tuyển chọn dành cho nhà sưu tầm tinh hoa
              </h2>
            </div>
            <Link href="/storefront" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
              Khám phá bộ sưu tập <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {premiumLots.map((lot) => (
              <article key={lot.title} className="group overflow-hidden rounded-md border border-white/10 bg-[#0e0d0b]">
                <div className="relative h-72 overflow-hidden">
                  <img src={lot.image} alt={lot.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <button className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/35 text-[#d4aa61] backdrop-blur" aria-label={`Lưu ${lot.title}`}>
                    <span className="material-symbols-outlined">favorite</span>
                  </button>
                </div>
                <div className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d4aa61]">{lot.category}</p>
                  <h3 className={`${playfair.className} mt-3 min-h-16 text-2xl font-medium leading-tight text-white`}>{lot.title}</h3>
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[#9d948a]">Giá hiện tại</p>
                      <p className="mt-1 text-lg font-semibold text-[#efcf88]">{lot.price}</p>
                    </div>
                    <Link href="/auctions/1" className="grid h-11 w-11 place-items-center rounded-full bg-[#d4aa61] text-[#100d08]" aria-label={`Đấu giá ${lot.title}`}>
                      <span className="material-symbols-outlined">gavel</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[linear-gradient(180deg,#11100d,#070706)] px-5 py-20 md:px-12">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>Quy trình đấu giá</Eyebrow>
            <h2 className={`${playfair.className} text-4xl font-medium leading-tight text-white md:text-6xl`}>
              Đấu giá dễ dàng, bảo mật và minh bạch
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#b7aea3]">
              Mỗi bước trong hành trình Luxora được thiết kế để nhà sưu tầm có thể ra quyết định với đầy đủ thông tin, chứng thực và hỗ trợ chuyên gia.
            </p>
            <div className="mt-9 grid grid-cols-3 gap-4">
              {trustItems.map((item) => (
                <div key={item.label} className="border-l border-[#d4aa61]/50 pl-5">
                  <strong className={`${playfair.className} block text-3xl font-medium text-[#efcf88]`}>{item.value}</strong>
                  <p className="mt-2 text-sm leading-6 text-[#b7aea3]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {processSteps.map((step, index) => (
              <article key={step.title} className="relative overflow-hidden rounded-md border border-white/10 bg-white/[0.035] p-7">
                <span className={`${playfair.className} absolute right-6 top-5 text-5xl text-white/[0.04]`}>0{index + 1}</span>
                <span className="grid h-12 w-12 place-items-center rounded-full border border-[#d4aa61]/60 text-[#d4aa61]">
                  <span className="material-symbols-outlined">{step.icon}</span>
                </span>
                <h3 className={`${playfair.className} mt-7 text-2xl font-medium text-white`}>{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#b7aea3]">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 px-5 py-24 md:px-12">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#070706_0%,rgba(7,7,6,0.9)_42%,rgba(7,7,6,0.34)),url('https://images.unsplash.com/photo-1545987796-200677ee1011?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="relative z-10 mx-auto max-w-[1500px]">
          <div className="max-w-2xl">
            <Eyebrow>Không gian dành riêng cho hội viên</Eyebrow>
            <h2 className={`${playfair.className} text-4xl font-medium leading-tight text-white md:text-6xl`}>
              Trải nghiệm đấu giá riêng tư cùng chuyên gia
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#d8d0c6]">
              Đặt lịch tư vấn, tham gia preview room và nhận báo cáo thẩm định trước khi phiên đấu giá bắt đầu.
            </p>
            <div className="mt-9 flex flex-wrap gap-5">
              <GoldButton href="/auth/onboarding">
                Đăng ký hội viên <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
              </GoldButton>
              <OutlineButton href="/auth">Đăng nhập</OutlineButton>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0b0a09] px-5 py-20 md:px-12">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Tin tức & Góc sưu tầm</Eyebrow>
              <h2 className={`${playfair.className} text-4xl font-medium leading-tight text-white md:text-5xl`}>
                Kiến thức cho những quyết định xứng tầm
              </h2>
            </div>
            <Link href="#" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
              Xem tất cả bài viết <span className="material-symbols-outlined text-base">arrow_forward_ios</span>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {journalPosts.map((post) => (
              <article key={post.title} className="group overflow-hidden rounded-md border border-white/10 bg-[#11100d]">
                <div className="h-56 overflow-hidden">
                  <img src={post.image} alt={post.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d4aa61]">{post.date}</p>
                  <h3 className={`${playfair.className} mt-3 min-h-20 text-2xl font-medium leading-tight text-white`}>{post.title}</h3>
                  <Link href="#" className="mt-6 inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-[#d4aa61]">
                    Đọc thêm <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#050504] px-5 py-16 md:px-12">
        <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)_1.35fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-sm text-sm leading-7 text-[#9d948a]">
              Luxora Auction House kết nối những giá trị hiếm có với cộng đồng nhà sưu tầm tinh hoa tại Việt Nam và quốc tế.
            </p>
            <div className="mt-6 flex gap-3">
              {["alternate_email", "photo_camera", "smart_display", "business"].map((icon) => (
                <Link key={icon} href="#" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-[#d4aa61] transition hover:bg-[#d4aa61]/10">
                  <span className="material-symbols-outlined text-lg">{icon}</span>
                </Link>
              ))}
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#d4aa61]">{column.title}</h3>
              <ul className="space-y-3 text-sm text-[#9d948a]">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="transition hover:text-[#d4aa61]">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#d4aa61]">Nhận bản tin</h3>
            <p className="text-sm leading-7 text-[#9d948a]">Cập nhật lịch đấu giá, vật phẩm mới và báo cáo thị trường từ Luxora.</p>
            <form className="mt-6 flex overflow-hidden rounded border border-white/10 bg-[#0c0b0a]">
              <input className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-[#6f675e]" placeholder="Email của bạn" type="email" />
              <button className="grid w-14 place-items-center bg-[#d4aa61] text-[#100d08]" aria-label="Đăng ký nhận tin" type="button">
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-[1500px] flex-col justify-between gap-4 border-t border-white/10 pt-6 text-xs text-[#756d64] md:flex-row">
          <p>© 2026 Luxora Auction House. All rights reserved.</p>
          <p>Thiết kế cho trải nghiệm đấu giá cao cấp</p>
        </div>
      </footer>
    </main>
  );
}
