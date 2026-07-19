import AdminShell from "@/components/shells/AdminShell";

/**
 * Read-only view of the auction rules currently enforced by the backend
 * (BiddingService / StepCalculator / DepositCalculator / settlement).
 * Keep this page in sync when the backend rules change.
 */
const RULE_SECTIONS = [
  {
    title: "Đấu giá dài hạn (TIMED) — công khai, tiền thật",
    icon: "schedule",
    rules: [
      "Mọi người dùng đã xác thực KYC đều được đặt giá — không cần đặt cọc. Người bán bị cấm đặt giá cho sản phẩm của mình.",
      "Giá cao nhất, người dẫn đầu và lịch sử đấu giá hiển thị công khai.",
      "Bước giá = 5% giá hiện tại (làm tròn lên nghìn đồng). Lượt đầu tiên chỉ cần bằng giá khởi điểm.",
      "Khi đặt giá, số tiền tương ứng bị KHÓA trong ví; bị vượt giá thì hoàn lại ngay lập tức.",
      "Người thắng thanh toán bằng chính khoản tiền đã khóa (ký hợp đồng mua bán điện tử để hoàn tất).",
      "Thời gian phiên cố định 6–12 giờ, không gia hạn.",
    ],
  },
  {
    title: "Đấu giá trực tiếp (LIVE) — đặt cọc, chống sniping",
    icon: "sensors",
    rules: [
      "Phải đặt cọc (khóa trong ví) trước giờ bắt đầu ít nhất 3 phút mới được vào phòng.",
      "Phiên mở cửa sổ 3 phút; bước giá cố định theo bậc giá khởi điểm (100k / 500k / 5tr / 10tr).",
      "Chống sniping: đặt giá trong 15 giây cuối sẽ kéo thời gian còn lại về tối thiểu 15 giây.",
      "Thắng phiên: thanh toán trong 72 giờ; tiền cọc được trừ vào giá chốt.",
    ],
  },
  {
    title: "Thanh toán & xử phạt",
    icon: "gavel",
    rules: [
      "Người thắng không thanh toán trong 72 giờ: mất tiền cọc/tiền khóa (chuyển về nền tảng) và bị ghi 1 strike.",
      "Đủ số strike sẽ bị khóa tài khoản, chỉ admin mở lại được.",
      "Sản phẩm không có người thắng hoặc người thắng bỏ cọc sẽ quay lại hàng chờ duyệt để lên lịch đấu giá lại.",
      "Hoa hồng nền tảng 20% giá chốt; 80% chuyển cho người bán. Sản phẩm do nền tảng đăng: 100% về nền tảng.",
    ],
  },
] as const;

export default function AdminBiddingRulesPage() {
  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-xs font-semibold tracking-[0.3em] text-[var(--luxora-gold)]">
          QUẢN TRỊ HỆ THỐNG
        </p>
        <h1 className="font-display-lg mt-2 text-3xl">Luật đấu giá</h1>
        <p className="mt-2 text-sm text-white/50">
          Các quy tắc đang được hệ thống áp dụng tự động. Thay đổi luật cần cập nhật cấu
          hình backend.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {RULE_SECTIONS.map((section) => (
            <div key={section.title} className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl text-[var(--luxora-gold-light)]">
                  {section.icon}
                </span>
                <h2 className="text-sm font-semibold">{section.title}</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {section.rules.map((rule) => (
                  <li key={rule} className="flex gap-2 text-xs leading-5 text-white/60">
                    <span className="text-[var(--luxora-gold)]">•</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
