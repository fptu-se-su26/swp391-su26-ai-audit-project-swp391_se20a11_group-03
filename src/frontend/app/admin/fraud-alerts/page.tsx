import AdminShell from "@/components/shells/AdminShell";
import FraudAlertsClient from "@/app/admin/fraud-alerts/FraudAlertsClient";

export default function FraudAlertsPage() {
  return (
    <AdminShell>
      <FraudAlertsClient />
    </AdminShell>
  );
}
