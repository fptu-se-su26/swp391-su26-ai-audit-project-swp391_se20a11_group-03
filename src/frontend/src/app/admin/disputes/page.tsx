import AdminUseCasePage from "@/components/admin/AdminUseCasePage";

export default function DisputesPage() {
  return (
    <AdminUseCasePage
      title="Xử lý tranh chấp"
      subtitle="Trung tâm xử lý khiếu nại giữa người mua, người bán và nền tảng."
      sections={[
        {
          icon: "support_agent",
          title: "Khiếu nại đang mở",
          description: "Tiếp nhận và phân loại tranh chấp từ người dùng.",
          status: "Queue",
        },
        {
          icon: "image_search",
          title: "Bằng chứng giao dịch",
          description: "Kiểm tra ảnh, tin nhắn, lịch sử bid và trạng thái thanh toán.",
        },
        {
          icon: "balance",
          title: "Quyết định xử lý",
          description: "Đưa ra kết luận hoàn tiền, giữ cọc, hủy phiên hoặc cảnh báo tài khoản.",
        },
        {
          icon: "history",
          title: "Lịch sử tranh chấp",
          description: "Tra cứu toàn bộ quyết định đã được xử lý trước đó.",
        },
      ]}
    />
  );
}
