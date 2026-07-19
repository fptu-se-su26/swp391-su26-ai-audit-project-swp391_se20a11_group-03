import AdminShell from "@/components/shells/AdminShell";
import FraudSettingsClient from "@/app/admin/fraud-settings/FraudSettingsClient";

export default function FraudSettingsPage() {
  return (
    <AdminShell>
      <FraudSettingsClient />
    </AdminShell>
  );
}
