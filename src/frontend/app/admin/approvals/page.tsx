import ApprovalsClient from "@/app/staff/approvals/ApprovalsClient";
import AdminShell from "@/components/shells/AdminShell";

export default function AdminApprovalsPage() {
  return (
    <AdminShell>
      <ApprovalsClient />
    </AdminShell>
  );
}
