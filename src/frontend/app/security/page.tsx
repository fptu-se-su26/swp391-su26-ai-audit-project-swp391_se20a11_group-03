import CollectorShell from "@/components/shells/CollectorShell";
import SecurityClient from "@/app/security/SecurityClient";

export default function SecurityPage() {
  return (
    <CollectorShell>
      <SecurityClient />
    </CollectorShell>
  );
}
