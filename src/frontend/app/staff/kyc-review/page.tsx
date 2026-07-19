import StaffShell from "@/components/shells/StaffShell";
import KycReviewClient from "@/app/staff/kyc-review/KycReviewClient";

export default function StaffKycReviewPage() {
  return (
    <StaffShell>
      <KycReviewClient />
    </StaffShell>
  );
}
