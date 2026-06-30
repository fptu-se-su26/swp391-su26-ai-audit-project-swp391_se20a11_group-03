import Link from "next/link";
import SellerBenefits from "./SellerBenefits";

const steps = [
  ["01", "Gửi thông tin sản phẩm", "Hình ảnh, nguồn gốc và mô tả chi tiết."],
  ["02", "BidZone xác minh", "Chuyên gia thẩm định tính xác thực và giá trị."],
  ["03", "Mở phiên đấu giá", "Tiếp cận collector và nhận bid trực tiếp."],
];

export default function SellerAccessRequired({ mode }: { mode: "signin" | "upgrade" }) {
  return (
    <div className="mx-auto max-w-[1260px] px-4 py-10 sm:px-7 lg:px-10 lg:py-14">
      <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#c6a75a]/30 bg-[#c6a75a]/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.18em] text-[#87651f]"><span className="material-symbols-outlined text-[14px]">diamond</span>Private seller services</div><h1 className="font-display-lg text-3xl font-semibold tracking-[-.04em] text-[#071626] sm:text-4xl">Sell with BidZone</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[#65717b]">List your rare watches, art, jewelry, and collectibles for verified luxury auctions.</p></div>
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-xs font-bold text-[#86631c] hover:text-[#071626]"><span className="material-symbols-outlined text-[17px]">arrow_back</span>Trở về trang chủ</Link>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.18fr_.82fr]">
        <section className="relative overflow-hidden rounded-[28px] border border-[#d7c9a8] bg-[#071626] p-6 text-white shadow-[0_24px_70px_rgba(7,22,38,.18)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_8%,rgba(213,181,101,.24),transparent_26%),linear-gradient(135deg,transparent_55%,rgba(255,255,255,.035)_55%)]" />
          <div className="relative">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-[#d8ba70]/30 bg-[#d8ba70]/10 text-[#e6cb84] shadow-inner"><span className="material-symbols-outlined text-[27px]">{mode === "signin" ? "shield_lock" : "storefront"}</span></div>
            <p className="mt-8 text-[9px] font-bold uppercase tracking-[.2em] text-[#d7ba70]">Secure seller access</p>
            <h2 className="mt-3 max-w-xl font-display-lg text-2xl font-semibold leading-tight tracking-[-.03em] sm:text-3xl">{mode === "signin" ? "Đăng nhập để đăng sản phẩm đấu giá" : "Nâng cấp tài khoản Seller để bắt đầu"}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[#aebbc6]">Vui lòng đăng nhập hoặc nâng cấp tài khoản người bán để gửi sản phẩm, xác minh quyền sở hữu và bắt đầu phiên đấu giá.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={mode === "signin" ? "/auth" : "/profile#seller-upgrade"} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#dfbf70] px-6 py-3.5 text-sm font-bold text-[#071626] transition hover:-translate-y-0.5 hover:bg-[#efd694]">{mode === "signin" ? "Đăng nhập" : "Đăng ký Seller Account"}<span className="material-symbols-outlined text-[18px]">arrow_forward</span></Link>
              <a href="#selling-process" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[.07]"><span className="material-symbols-outlined text-[18px]">info</span>Tìm hiểu quy trình bán hàng</a>
            </div>
          </div>
        </section>

        <aside className="rounded-[28px] border border-[#ded7ca] bg-[#fffdf8]/90 p-6 shadow-[0_14px_45px_rgba(18,31,44,.07)] backdrop-blur sm:p-8">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eee6d3] text-[#947128]"><span className="material-symbols-outlined">handshake</span></span>
          <h2 className="mt-5 font-display-lg text-xl font-semibold tracking-[-.03em] text-[#071626]">Bạn muốn trở thành người bán?</h2>
          <p className="mt-3 text-sm leading-6 text-[#6d7780]">Mở Seller Account để nhận hỗ trợ định giá, thẩm định chuyên sâu và tiếp cận mạng lưới người mua toàn cầu.</p>
          <Link href="/profile#seller-upgrade" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#b9974f] px-5 py-3 text-xs font-bold uppercase tracking-[.1em] text-[#78591b] transition hover:bg-[#071626] hover:text-[#f0d58a]">Đăng ký Seller Account<span className="material-symbols-outlined text-[17px]">north_east</span></Link>
          <div className="mt-6 border-t border-[#e4ded3] pt-5"><p className="flex items-center gap-2 text-[11px] font-semibold text-[#52606c]"><span className="material-symbols-outlined text-[16px] text-[#4d8a75]">verified_user</span>Không phí đăng ký · Bảo mật thông tin</p></div>
        </aside>
      </div>

      <section id="selling-process" className="mt-6 rounded-[26px] border border-[#dfd8cb] bg-white/70 p-6 backdrop-blur sm:p-8">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#987328]">Simple. Secure. Global.</p><h2 className="mt-2 font-display-lg text-2xl font-semibold tracking-[-.03em] text-[#071626]">Quy trình bán hàng minh bạch</h2></div><p className="text-xs text-[#7a8289]">Đội ngũ chuyên gia đồng hành ở mọi bước.</p></div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">{steps.map(([number, title, description], index) => <div key={number} className="relative rounded-2xl border border-[#e5dfd4] bg-[#fffdf9] p-5"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold text-[#a17b2c]">{number}</span><span className="material-symbols-outlined text-[18px] text-[#b69a5a]">{index === 0 ? "edit_note" : index === 1 ? "fact_check" : "campaign"}</span></div><h3 className="mt-6 text-sm font-bold text-[#102235]">{title}</h3><p className="mt-2 text-xs leading-5 text-[#727b83]">{description}</p>{index < 2 && <span className="absolute -right-3 top-1/2 z-10 hidden h-px w-6 bg-[#cdbd99] md:block" />}</div>)}</div>
      </section>

      <div className="mt-5"><SellerBenefits /></div>
    </div>
  );
}

