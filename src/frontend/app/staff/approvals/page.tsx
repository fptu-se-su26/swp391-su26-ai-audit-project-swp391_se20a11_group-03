import StaffShell from "@/components/shells/StaffShell";
import ApprovalsClient from "@/app/staff/approvals/ApprovalsClient";

export default function StaffApprovalsPage() {
  return (
    <StaffShell>
      <ApprovalsClient />
    </StaffShell>
  );
}
