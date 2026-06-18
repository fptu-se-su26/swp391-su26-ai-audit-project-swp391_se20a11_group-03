import AdminUseCasePage from "@/components/admin/AdminUseCasePage";

export default function FinancialPoliciesPage() {
  return (
    <AdminUseCasePage
      title="Cấu hình chính sách tài chính"
      subtitle="Quản lý phí nền tảng, thuế, đặt cọc, hoàn tiền và quy tắc thanh toán."
      sections={[
        {
          icon: "percent",
          title: "Phí nền tảng",
          description: "Thiết lập phí dịch vụ tính trên giao dịch thắng đấu giá.",
          status: "Config",
        },
        {
          icon: "receipt_long",
          title: "Thuế giao dịch",
          description: "Quản lý thuế áp dụng khi tạo sản phẩm hoặc chốt đơn đấu giá.",
        },
        {
          icon: "undo",
          title: "Hoàn cọc",
          description: "Quy định hoàn cọc cho người không thắng hoặc khi phiên bị hủy.",
          status: "Required",
        },
        {
          icon: "payments",
          title: "Rút tiền",
          description: "Đặt giới hạn rút tiền, thời gian xử lý và quy tắc kiểm duyệt.",
        },
      ]}
    />
  );
}
