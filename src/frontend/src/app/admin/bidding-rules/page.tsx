import AdminUseCasePage from "@/components/admin/AdminUseCasePage";

export default function BiddingRulesPage() {
  return (
    <AdminUseCasePage
      title="Cấu hình luật đấu giá"
      subtitle="Quản trị các quy tắc tham gia, bước giá và điều kiện đặt cọc."
      sections={[
        {
          icon: "price_change",
          title: "Bước giá tối thiểu",
          description: "Thiết lập mức tăng giá tối thiểu theo từng nhóm sản phẩm hoặc khoảng giá.",
          status: "Policy",
        },
        {
          icon: "account_balance_wallet",
          title: "Yêu cầu đặt cọc",
          description: "Kiểm soát tỉ lệ đặt cọc bắt buộc trước khi người dùng được tham gia phiên đấu giá.",
          status: "Active",
        },
        {
          icon: "timer",
          title: "Gia hạn phiên",
          description: "Cấu hình luật tự động gia hạn khi có bid sát thời điểm kết thúc.",
        },
        {
          icon: "verified_user",
          title: "Điều kiện KYC",
          description: "Chỉ cho phép tài khoản đã xác minh danh tính tham gia đặt giá.",
          status: "Enabled",
        },
      ]}
    />
  );
}
