import AdminUseCasePage from "@/components/admin/AdminUseCasePage";

export default function AuditLogsPage() {
  return (
    <AdminUseCasePage
      title="Nhật ký hệ thống"
      subtitle="Theo dõi các hành động quan trọng trong hệ thống để phục vụ kiểm toán."
      sections={[
        {
          icon: "login",
          title: "Đăng nhập & bảo mật",
          description: "Ghi nhận đăng nhập, đăng xuất, khóa tài khoản và các lần xác thực thất bại.",
        },
        {
          icon: "rule",
          title: "Thao tác quản trị",
          description: "Theo dõi thay đổi danh mục, quyền, chính sách và dữ liệu nhạy cảm.",
          status: "Admin",
        },
        {
          icon: "gavel",
          title: "Hoạt động đấu giá",
          description: "Lưu dấu bid, đặt cọc, hoàn cọc, kết thúc phiên và xử lý người thắng.",
        },
        {
          icon: "webhook",
          title: "Webhook thanh toán",
          description: "Giám sát webhook SePay, trạng thái nạp tiền và lỗi đối soát.",
        },
      ]}
    />
  );
}
