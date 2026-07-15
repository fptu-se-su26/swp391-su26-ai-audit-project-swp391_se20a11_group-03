import KycReviewClient from "@/app/staff/kyc-review/KycReviewClient";
import AdminShell from "@/components/shells/AdminShell";

export default function AdminKycReviewPage() {
  return (
    <AdminShell>
      <KycReviewClient />
    </AdminShell>
  );
}
