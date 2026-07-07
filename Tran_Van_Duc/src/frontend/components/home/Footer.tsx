import Link from "next/link";
import BidZoneLogo from "@/components/brand/BidZoneLogo";

const footerColumns = [
  {
    title: "THÔNG TIN",
    links: ["Về chúng tôi", "Liên hệ", "Điều khoản sử dụng", "Chính sách bảo mật"],
  },
  {
    title: "HỖ TRỢ",
    links: ["Trung tâm trợ giúp", "Hướng dẫn đấu giá", "Thanh toán", "Vận chuyển & giao nhận"],
  },
  {
    title: "DANH MỤC",
    links: ["Đồng hồ", "Điện thoại", "Laptop", "Máy ảnh", "Xem tất cả"],
  },
];

const socialItems = ["f", "ig", "x", "yt"];

export default function Footer() {
  return (
    <footer className="bg-black">
      <div className="mx-auto max-w-[1600px] px-4 py-10 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-10 lg:grid-cols-[1.2fr_2fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center"
              aria-label="BidZone"
            >
              <BidZoneLogo className="h-14 w-auto" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              Nền tảng đấu giá trực tuyến các sản phẩm cao cấp, uy tín hàng đầu
              Châu Á. Nơi giá trị được tôn vinh.
            </p>
            <div className="mt-5 flex gap-3">
              {socialItems.map((item) => (
                <span
                  key={item}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-[11px] font-semibold uppercase text-white/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold tracking-[0.2em] text-[#f0c982]">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link
                        href="/storefront"
                        className="text-sm text-white/55 transition-colors hover:text-white"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-[0.2em] text-[#f0c982]">
              LIÊN HỆ
            </h3>
            <div className="mt-4 space-y-2 text-sm leading-relaxed text-white/55">
              <p>Hotline: 1900 8888</p>
              <p>Email: support@bidzone.com</p>
              <p>Địa chỉ: 123 Lê Lợi, Quận 1, TP. Hồ Chí Minh</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2024 BidZone. Bảo lưu mọi quyền.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-white/75">
            <span>VISA</span>
            <span>Mastercard</span>
            <span>PayPal</span>
            <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
