import AdminShell from "@/components/shells/AdminShell";
import SalesHistoryClient from "@/app/admin/sales-history/SalesHistoryClient";

export default function AdminSalesHistoryPage() {
  return (
    <AdminShell>
      <SalesHistoryClient />
    </AdminShell>
  );
}
