import Image from "next/image";
import Link from "next/link";

const COLLECTIONS = [
  {
    title: "Đồng hồ danh tiếng",
    description: "Cơ khí chính xác, provenance rõ ràng và giá trị vượt thời gian.",
    image: "/images/backgrounds/auction-bg-watch.png",
    eyebrow: "Fine watches",
    className: "min-h-[420px] lg:min-h-[570px]",
    imageClassName: "object-cover object-center",
  },
  {
    title: "Công nghệ biểu tượng",
    description: "Thiết bị được tuyển chọn theo thiết kế, hiệu năng và độ hiếm.",
    image: "/images/backgrounds/auction-bg-phone.png",
    eyebrow: "Technology",
    className: "min-h-[270px] sm:col-span-2",
    imageClassName: "object-cover object-center",
  },
  {
    title: "Nhiếp ảnh & quang học",
    description: "Những công cụ dành cho người kể chuyện bằng hình ảnh.",
    image: "/images/auction-products/leica-m11.png",
    eyebrow: "Cameras",
    className: "min-h-[280px]",
    imageClassName: "object-contain object-[72%_center] p-6",
  },
  {
    title: "Âm thanh cá nhân",
    description: "Trải nghiệm nghe nhìn cao cấp trong một thiết kế khác biệt.",
    image: "/images/auction-products/airpods-max.png",
    eyebrow: "Audio",
    className: "min-h-[280px]",
    imageClassName: "object-contain object-[72%_center] p-6",
  },
];

const STANDARDS = [
  {
    icon: "fact_check",
    title: "Hồ sơ vật phẩm rõ ràng",
    description:
      "Thông tin, hình ảnh và tài liệu liên quan được trình bày tập trung trước phiên đấu giá.",
  },
  {
    icon: "account_balance_wallet",
    title: "Đặt cọc có kiểm soát",
    description:
      "Cơ chế đặt cọc giúp tăng tính cam kết và hạn chế những lượt trả giá thiếu nghiêm túc.",
  },
  {
    icon: "history",
    title: "Lịch sử giao dịch minh bạch",
    description:
      "Trạng thái phiên, mức giá và các mốc xử lý được lưu lại để người dùng dễ dàng theo dõi.",
  },
  {
    icon: "shield_lock",
    title: "Bảo vệ tài khoản nhiều lớp",
    description:
      "Xác minh danh tính và kiểm soát quyền truy cập được tích hợp xuyên suốt hành trình sử dụng.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Tôi cần làm gì trước khi tham gia đấu giá?",
    answer:
      "Bạn cần tạo tài khoản, hoàn thiện thông tin cần thiết và nộp khoản đặt cọc theo yêu cầu của phiên đấu giá.",
  },
  {
    question: "Làm sao để biết một phiên đang diễn ra?",
    answer:
      "Các phiên đang hoạt động được đánh dấu Live trên trang đấu giá. Bạn có thể mở phòng đấu giá để theo dõi giá và thời gian còn lại.",
  },
  {
    question: "Khoản đặt cọc được xử lý như thế nào?",
    answer:
      "Khoản đặt cọc được ghi nhận trong ví BidZone và được xử lý theo kết quả cũng như điều kiện cụ thể của từng phiên.",
  },
  {
    question: "Tôi có thể theo dõi những vật phẩm quan tâm không?",
    answer:
      "Có. Hãy thêm vật phẩm vào Watchlist để truy cập nhanh và theo dõi trạng thái phiên từ khu vực tài khoản.",
  },
  {
    question: "Người bán đăng vật phẩm bằng cách nào?",
    answer:
      "Tài khoản người bán có thể tạo hồ sơ vật phẩm, tải ảnh và gửi duyệt trước khi vật phẩm được đưa vào lịch đấu giá.",
  },
  {
    question: "Tôi cần hỗ trợ trong quá trình giao dịch?",
    answer:
      "Bạn có thể sử dụng khu vực tin nhắn hoặc hỗ trợ trong tài khoản để gửi yêu cầu và theo dõi phản hồi từ BidZone.",
  },
];

export default function HomeDiscoverySections() {
  return (
    <>
      <section id="collections" className="border-b border-white/10">
        <div className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--luxora-gold)]">
                Khám phá theo sở thích
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
                Mỗi bộ sưu tập,
                <br className="hidden sm:block" /> một câu chuyện riêng.
              </h2>
            </div>
            <div className="max-w-xl">
              <p className="text-sm leading-7 text-white/60 sm:text-base">
                Bắt đầu từ lĩnh vực bạn yêu thích và khám phá những vật phẩm
                đang được cộng đồng quan tâm.
              </p>
              <Link
                href="/categories"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--luxora-gold)] transition-colors hover:text-[var(--luxora-gold-light)]"
              >
                Xem tất cả danh mục
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
            <CollectionCard item={COLLECTIONS[0]} priority />
            <div className="grid gap-4 sm:grid-cols-2">
              {COLLECTIONS.slice(1).map((item) => (
                <CollectionCard key={item.title} item={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="standards" className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(240,201,130,0.09),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1600px] gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:px-12 lg:py-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--luxora-gold)]">
              Tiêu chuẩn BidZone
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              Niềm tin được xây dựng từ chi tiết.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
              Một phiên đấu giá tốt không chỉ nằm ở vật phẩm. Nó còn đến từ
              thông tin dễ kiểm chứng, quy trình dễ theo dõi và trách nhiệm rõ
              ràng ở từng bước.
            </p>
            <Link
              href="/about"
              className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d7aa63]/45 px-6 text-xs font-semibold uppercase tracking-[0.13em] text-white transition-colors hover:bg-[#f0c982] hover:text-black"
            >
              Hiểu thêm về BidZone
              <span className="material-symbols-outlined text-base">north_east</span>
            </Link>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[var(--luxora-bg-elevated)]">
            {STANDARDS.map((item, index) => (
              <article
                key={item.title}
                className="group grid gap-5 border-b border-white/10 p-6 last:border-0 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:p-8"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#d7aa63]/30 bg-[#f0c982]/10 text-[var(--luxora-gold)] transition-transform duration-300 group-hover:scale-105">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </span>
                <div>
                  <h3 className="text-base font-bold text-white sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                    {item.description}
                  </p>
                </div>
                <span className="hidden font-serif text-3xl text-white/10 sm:block">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-b border-white/10">
        <div className="mx-auto grid max-w-[1600px] gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.65fr_1.35fr] lg:px-12 lg:py-24">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[var(--luxora-gold)]">
              Cần biết trước khi bắt đầu
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">
              Câu hỏi thường gặp
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
              Những thông tin cơ bản giúp bạn tự tin hơn khi tham gia mua bán
              và đấu giá trên BidZone.
            </p>
          </div>

          <div className="grid gap-3">
            {FAQ_ITEMS.map((item, index) => (
              <details
                key={item.question}
                className="group rounded-2xl border border-white/10 bg-[var(--luxora-bg-elevated)] px-5 py-1 open:border-[#d7aa63]/35 sm:px-7"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 py-4 text-sm font-semibold text-white marker:hidden sm:text-base">
                  <span className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-[var(--luxora-gold)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {item.question}
                  </span>
                  <span className="material-symbols-outlined shrink-0 text-xl text-white/40 transition-transform group-open:rotate-45 group-open:text-[var(--luxora-gold)]">
                    add
                  </span>
                </summary>
                <p className="border-t border-white/10 py-5 pl-9 text-sm leading-7 text-white/55 sm:pl-12">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CollectionCard({
  item,
  priority = false,
}: {
  item: (typeof COLLECTIONS)[number];
  priority?: boolean;
}) {
  return (
    <Link
      href="/storefront"
      className={`theme-dark-content theme-dark-surface group relative overflow-hidden rounded-[28px] border border-white/10 bg-[#050505] ${item.className}`}
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        priority={priority}
        sizes="(min-width: 1024px) 55vw, 100vw"
        className={`${item.imageClassName} transition-transform duration-700 group-hover:scale-[1.035]`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/5" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 sm:p-8">
        <div className="max-w-md">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f0c982]">
            {item.eyebrow}
          </p>
          <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-white/65">
            {item.description}
          </p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white backdrop-blur transition-colors group-hover:border-[#f0c982] group-hover:bg-[#f0c982] group-hover:text-black">
          <span className="material-symbols-outlined text-lg">arrow_outward</span>
        </span>
      </div>
    </Link>
  );
}
