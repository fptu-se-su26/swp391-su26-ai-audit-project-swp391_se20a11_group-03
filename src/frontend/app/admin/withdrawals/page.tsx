import AdminShell from "@/components/shells/AdminShell";
import WithdrawalsClient from "@/app/admin/withdrawals/WithdrawalsClient";

export default function AdminWithdrawalsPage() {
  return (
    <AdminShell>
      <WithdrawalsClient />
    </AdminShell>
  );
}
