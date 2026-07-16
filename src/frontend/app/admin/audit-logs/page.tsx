import AdminShell from "@/components/shells/AdminShell";
import AuditLogsClient from "@/app/admin/audit-logs/AuditLogsClient";

export default function AdminAuditLogsPage() {
  return (
    <AdminShell>
      <AuditLogsClient />
    </AdminShell>
  );
}
