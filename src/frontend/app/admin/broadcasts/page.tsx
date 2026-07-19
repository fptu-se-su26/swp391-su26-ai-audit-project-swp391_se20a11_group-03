import AdminShell from "@/components/shells/AdminShell";
import BroadcastsClient from "@/app/admin/broadcasts/BroadcastsClient";

export default function AdminBroadcastsPage() {
  return (
    <AdminShell>
      <BroadcastsClient />
    </AdminShell>
  );
}
