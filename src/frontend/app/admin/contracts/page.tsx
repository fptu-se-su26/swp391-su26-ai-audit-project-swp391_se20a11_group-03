import AdminShell from "@/components/shells/AdminShell";
import ContractsClient from "@/app/admin/contracts/ContractsClient";

export default function AdminContractsPage() {
  return (
    <AdminShell>
      <ContractsClient />
    </AdminShell>
  );
}
