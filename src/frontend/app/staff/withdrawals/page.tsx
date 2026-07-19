import StaffShell from "@/components/shells/StaffShell";
import WithdrawalsClient from "@/app/admin/withdrawals/WithdrawalsClient";

export default function StaffWithdrawalsPage() {
  return (
    <StaffShell>
      <WithdrawalsClient />
    </StaffShell>
  );
}
