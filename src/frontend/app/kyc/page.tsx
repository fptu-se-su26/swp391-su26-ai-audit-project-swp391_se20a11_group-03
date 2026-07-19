import CollectorShell from "@/components/shells/CollectorShell";
import KycClient from "@/app/kyc/KycClient";

export default function KycPage() {
  return (
    <CollectorShell>
      <KycClient />
    </CollectorShell>
  );
}
