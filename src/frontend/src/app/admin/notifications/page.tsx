import AdminUseCasePage from "@/components/admin/AdminUseCasePage";

export default function NotificationsPage() {
  return (
    <AdminUseCasePage
      title="Quản lý thông báo"
      subtitle="Gửi và kiểm soát thông báo toàn hệ thống cho user, seller, staff."
      sections={[
        {
          icon: "campaign",
          title: "Broadcast",
          description: "Gửi thông báo hàng loạt tới toàn bộ nền tảng hoặc theo từng nhóm vai trò.",
          status: "Admin",
        },
        {
          icon: "notifications_active",
          title: "Cảnh báo phiên đấu giá",
          description: "Thiết lập thông báo khi phiên sắp bắt đầu, sắp kết thúc hoặc có bid mới.",
        },
        {
          icon: "mark_email_read",
          title: "Email & In-app",
          description: "Quản lý kênh gửi thông báo trong app hoặc qua email.",
        },
        {
          icon: "archive",
          title: "Lịch sử thông báo",
          description: "Theo dõi các thông báo đã gửi và trạng thái đọc của người nhận.",
        },
      ]}
    />
  );
}
